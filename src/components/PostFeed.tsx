'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter, Loader2, LayoutGrid } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export default function PostFeed({ user }: { user: User }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const supabase = createClient()

  // Use ref to store the latest fetchPosts to avoid subscription churn
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
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [search, subjectFilter, supabase])

  // Update ref whenever fetchPosts changes
  useEffect(() => {
    fetchPostsRef.current = fetchPosts
  }, [fetchPosts])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPosts()
    }, 0)

    // Realtime for new posts - using ref to call the latest fetchPosts
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
      clearTimeout(timer)
      void supabase.removeChannel(channel)
    }
  }, [supabase, fetchPosts])

  return (
    <div className="space-y-8 pb-24">
      <CreatePost user={user} onPostCreated={() => void fetchPosts()} />

      {/* Header & Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid size={20} className="text-blue-500" />
            <h2 className="text-lg font-black text-foreground">Publications</h2>
          </div>
          <span className="text-xs font-bold text-foreground/30">{posts.length} posts</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 bg-card p-2 rounded-2xl shadow-lg border border-border">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Rechercher une publication..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-transparent rounded-xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm text-foreground placeholder:text-foreground/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-56 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Filtrer par matière..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-transparent rounded-xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm text-foreground placeholder:text-foreground/20"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-sm font-bold text-foreground/30 animate-pulse">Chargement du flux...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={() => void fetchPosts()} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border flex flex-col items-center gap-4">
              <div className="bg-background p-4 rounded-full border border-border">
                <Search size={32} className="text-foreground/10" />
              </div>
              <div className="space-y-1">
                <p className="text-foreground/60 font-bold text-lg">Aucune publication trouvée</p>
                <p className="text-foreground/30 text-sm">Essayez de modifier vos filtres ou de créer un post.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
