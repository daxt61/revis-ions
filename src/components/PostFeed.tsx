'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter } from 'lucide-react'
import { Post } from '@/types'
import { User } from '@supabase/supabase-js'

export default function PostFeed({ user }: { user: User }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const supabase = createClient()

  // Use a ref to store the latest fetchPosts to avoid subscription churn
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (data) setPosts(data as any[])
    setLoading(false)
  }, [supabase, search, subjectFilter])

  // Update the ref whenever fetchPosts would change (due to search/subjectFilter)
  useEffect(() => {
    fetchPostsRef.current = fetchPosts
  }, [fetchPosts])

  // Separate effect for the initial fetch and search/filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPosts()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchPosts])

  // Separate effect for the Realtime subscription (no dependencies)
  useEffect(() => {
    const channel = supabase
      .channel('public:posts')
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
    <div className="space-y-6 pb-20">
      <CreatePost user={user} onPostCreated={fetchPosts} />

      {/* Filters */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 bg-card p-3 rounded-2xl shadow-sm border border-border">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Rechercher par titre ou description..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-foreground placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Matière..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-foreground placeholder:text-muted-foreground"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={fetchPosts} />
          ))}
          {!loading && posts.length === 0 && (
            <div className="text-center py-10 bg-card rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground">Aucune publication trouvée.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
