'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter, Loader2, Sparkles } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export default function PostFeed({ user }: { user: User }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const supabase = createClient()

  // Use a ref to store the latest fetch function for the stable subscription effect
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

    const { data, error } = await query
    if (data) setPosts(data)
    setLoading(false)
  }, [search, subjectFilter, supabase])

  useEffect(() => {
    fetchPostsRef.current = fetchPosts
  }, [fetchPosts])

  // Initial and parameterized fetch
  useEffect(() => {
    void fetchPosts()
  }, [fetchPosts])

  // Stable Realtime subscription
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
    <div className="space-y-10 pb-20">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-orange-400/50 rounded-3xl blur-2xl opacity-20 pointer-events-none"></div>
        <CreatePost user={user} onPostCreated={fetchPosts} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-3xl shadow-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={20} />
          <input
            type="text"
            placeholder="Rechercher une notion, un titre..."
            className="w-full pl-12 pr-4 py-3.5 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={20} />
          <input
            type="text"
            placeholder="Matière (Maths...)"
            className="w-full pl-12 pr-4 py-3.5 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium transition-all outline-none"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Chargement du flux...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PostCard post={post} currentUser={user} onUpdate={fetchPosts} />
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center gap-4">
              <Sparkles className="text-muted-foreground/30" size={48} />
              <div className="space-y-1">
                <p className="text-foreground font-black text-lg tracking-tight">Aucun résultat trouvé</p>
                <p className="text-muted-foreground text-sm font-medium">Réessayez avec d&apos;autres mots-clés ou filtres.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
