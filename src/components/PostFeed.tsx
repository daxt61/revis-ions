'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter, Ghost } from 'lucide-react'

export default function PostFeed({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const supabase = createClient()

  const fetchPostsRef = useRef<() => Promise<void>>(async () => {})

  const fetchPosts = useCallback(async () => {
    setLoading(true)
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
    setLoading(false)
  }, [supabase, search, subjectFilter])

  useEffect(() => {
    fetchPostsRef.current = fetchPosts
  }, [fetchPosts])

  useEffect(() => {
    void fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    // Realtime for new posts - stable effect
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes' as any, { event: '*', table: 'posts' }, () => {
        void fetchPostsRef.current()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-8 pb-32">
      <CreatePost user={user} onPostCreated={fetchPosts} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-3xl shadow-xl border border-border">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Rechercher une publication..."
            className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-56 group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Matière (ex: Math)"
            className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Chargement des revis-ions...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={fetchPosts} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center">
                <Ghost size={32} className="text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-lg font-black text-foreground">Rien ici pour le moment</h4>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">Aucune publication trouvée avec ces critères. Essayez de modifier vos filtres.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
