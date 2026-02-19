'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter } from 'lucide-react'
import { type User as SupabaseUser } from '@supabase/supabase-js'
import { Post } from '@/types'

export default function PostFeed({ user }: { user: SupabaseUser }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const supabase = createClient()

  const fetchPostsRef = useRef<() => Promise<void>>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('posts')
        .select('*, profiles(username, avatar_url), votes(value, user_id), comments(count)')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (subjectFilter) {
        query = query.ilike('subject', `%${subjectFilter}%`)
      }

      const { data } = await query
      if (data) setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, search, subjectFilter])

  useEffect(() => {
    fetchPostsRef.current = fetchPosts
  }, [fetchPosts])

  useEffect(() => {
    void fetchPosts()

    // Realtime for new posts
    const channel = supabase
      .channel('public:posts')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'posts' }, () => {
        if (fetchPostsRef.current) {
          void fetchPostsRef.current()
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase, fetchPosts])

  return (
    <div className="space-y-8 pb-24">
      <CreatePost user={user} onPostCreated={fetchPosts} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-3xl shadow-xl border border-border/50">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
          <input
            type="text"
            placeholder="Rechercher une pépite..."
            className="w-full pl-12 pr-4 py-3 bg-secondary/30 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-56 group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={20} />
          <input
            type="text"
            placeholder="Filtrer par matière"
            className="w-full pl-12 pr-4 py-3 bg-secondary/30 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 h-12 w-12 border-4 border-transparent border-b-primary/40 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm font-black italic text-muted-foreground animate-pulse uppercase tracking-widest">Chargement du flux...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={fetchPosts} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-card/50 rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center gap-4">
              <div className="bg-secondary/50 p-4 rounded-full">
                <Search size={32} className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black text-foreground uppercase tracking-tight">Le désert total</p>
                <p className="text-sm text-muted-foreground italic">Aucune publication ne correspond à votre recherche.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
