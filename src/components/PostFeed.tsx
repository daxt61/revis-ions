'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter, Sparkles, AlertCircle } from 'lucide-react'

export default function PostFeed({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const supabase = createClient()

  // Use a ref to store the fetch function so the subscription effect can access it without being re-triggered
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

  // Update the ref whenever fetchPosts changes
  useEffect(() => {
    fetchPostsRef.current = fetchPosts
  }, [fetchPosts])

  // Initial fetch and parameterized load
  useEffect(() => {
    void fetchPosts()
  }, [fetchPosts])

  // Stable Realtime Subscription
  useEffect(() => {
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
      <div className="relative">
         <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 backdrop-blur-sm animate-bounce">
            <Sparkles size={16} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Nouveautés au Hub</span>
         </div>
         <CreatePost user={user} onPostCreated={fetchPosts} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card/50 p-4 rounded-3xl shadow-xl border border-border/50 backdrop-blur-md">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Rechercher par mot-clé..."
            className="w-full pl-12 pr-5 py-3.5 bg-secondary border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground/50 shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-64 group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Filtrer par matière..."
            className="w-full pl-12 pr-5 py-3.5 bg-secondary border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground/50 shadow-inner"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Chargement du flux...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={fetchPosts} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-24 bg-card rounded-3xl border border-dashed border-border shadow-2xl flex flex-col items-center gap-4">
              <div className="p-4 bg-secondary/50 rounded-2xl text-muted-foreground border border-border/50">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">Rien à voir ici</p>
                <p className="text-xs text-muted-foreground font-medium">Aucune publication ne correspond à vos critères.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
