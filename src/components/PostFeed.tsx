'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter } from 'lucide-react'
import { User, Post } from '@/types/database'

export default function PostFeed({ user }: { user: User }) {
  const [posts, setPosts] = useState<Post[]>([])
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
    if (data) setPosts(data as any)
    if (error) console.error(error)
    setLoading(false)
  }, [search, subjectFilter, supabase])

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
        if (fetchPostsRef.current) {
          void fetchPostsRef.current()
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-6 pb-20">
      <CreatePost user={user} onPostCreated={() => { void fetchPosts() }} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-2xl shadow-sm border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Matière..."
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={() => { void fetchPosts() }} />
          ))}
          {!loading && posts.length === 0 && (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground">Aucune publication trouvée.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
