'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter, RefreshCw } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function PostFeed({ user }: { user: User }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const supabase = createClient()

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

  const fetchPostsRef = useRef(fetchPosts)
  useEffect(() => {
    fetchPostsRef.current = fetchPosts
  }, [fetchPosts])

  useEffect(() => {
    // Initial fetch with timeout to avoid react-hooks/set-state-in-effect
    const timer = setTimeout(() => {
      void fetchPosts()
    }, 0)

    // Realtime for new posts
    const channel = supabase
      .channel('public:posts')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'posts' }, () => {
        void fetchPostsRef.current()
      })
      .subscribe()

    return () => {
      clearTimeout(timer)
      void supabase.removeChannel(channel)
    }
  }, [fetchPosts, supabase])

  return (
    <div className="space-y-8 pb-24">
      <CreatePost user={user} onPostCreated={() => void fetchPosts()} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-2xl shadow-lg border border-border">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary" size={18} />
          <input
            type="text"
            placeholder="Rechercher une pépite..."
            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-muted/50 text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-56 group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary" size={18} />
          <input
            type="text"
            placeholder="Trier par matière..."
            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-muted/50 text-foreground"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
        <button
          onClick={() => void fetchPosts()}
          className="p-3 bg-background border border-border rounded-xl text-muted hover:text-primary hover:border-primary transition-all active:rotate-180 duration-500"
          title="Rafraîchir"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm font-bold text-muted animate-pulse uppercase tracking-widest">Chargement du flux...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={() => void fetchPosts()} />
          ))}
          {posts.length === 0 && !loading && (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center gap-4">
              <div className="p-4 bg-background rounded-full">
                <Search size={32} className="text-muted" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">Aucune publication trouvée</p>
                <p className="text-sm text-muted">Essayez d&apos;autres mots-clés ou filtres.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
