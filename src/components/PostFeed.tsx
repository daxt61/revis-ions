'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter, Loader2, RefreshCw } from 'lucide-react'

export default function PostFeed({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const supabase = createClient()
  const fetchPostsRef = useRef<() => Promise<void>>(null)

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

    const { data, error } = await query
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
    // Realtime for new posts, votes, and comments
    const channel = supabase
      .channel('public:posts_feed_updates')
      .on('postgres_changes' as any, { event: '*', table: 'posts' }, () => {
        void fetchPostsRef.current?.()
      })
      .on('postgres_changes' as any, { event: '*', table: 'votes' }, () => {
        void fetchPostsRef.current?.()
      })
      .on('postgres_changes' as any, { event: '*', table: 'comments' }, () => {
        void fetchPostsRef.current?.()
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
      <div className="flex flex-col sm:flex-row gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border shadow-xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Rechercher des révisions..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:bg-secondary outline-none text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-56 group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Filtrer par matière..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:bg-secondary outline-none text-sm transition-all"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
        <button
          onClick={() => void fetchPosts()}
          className="p-2.5 bg-secondary/50 hover:bg-secondary border border-border/50 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-95"
          title="Actualiser"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-muted-foreground font-medium animate-pulse">Chargement des pépites...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={fetchPosts} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border flex flex-col items-center gap-4">
              <div className="p-4 bg-secondary/50 rounded-full text-muted-foreground">
                <Search size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-foreground font-bold text-lg">Aucune publication trouvée</p>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Essayez de modifier vos filtres ou soyez le premier à poster quelque chose !
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
