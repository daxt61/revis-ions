'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter } from 'lucide-react'
import type { Post } from '@/types/database'
import type { User } from '@supabase/supabase-js'

export default function PostFeed({ user }: { user: User }) {
  const [posts, setPosts] = useState<Post[]>([])
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

    const { data, error } = await query
    if (data) setPosts(data as any)
    setLoading(false)
  }, [search, subjectFilter, supabase])

  const fetchPostsRef = useRef(fetchPosts)
  useEffect(() => {
    fetchPostsRef.current = fetchPosts
  }, [fetchPosts])

  // Initial load and filter changes
  useEffect(() => {
    void fetchPostsRef.current()
  }, [search, subjectFilter])

  // Stable Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:posts_realtime')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'posts' }, () => {
        void fetchPostsRef.current()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-8 pb-20">
      <CreatePost user={user} onPostCreated={fetchPosts} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card/50 p-4 rounded-2xl shadow-sm border border-border backdrop-blur-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Rechercher par titre ou description..."
            className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-white/10 outline-none text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-56 group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Matière..."
            className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-white/10 outline-none text-sm transition-all"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted">Chargement du flux...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={fetchPosts} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-border shadow-inner">
                <Search className="text-muted/40" size={32} />
              </div>
              <p className="text-muted font-medium">Aucune publication trouvée.</p>
              <button
                onClick={() => { setSearch(''); setSubjectFilter('') }}
                className="mt-4 text-primary text-sm font-bold hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
