'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter } from 'lucide-react'
import { Post } from '@/types'

function PostSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden flex animate-pulse">
      <div className="bg-muted/20 w-12 flex flex-col items-center py-4 gap-4 border-r border-border">
        <div className="w-6 h-6 bg-muted rounded" />
        <div className="w-4 h-4 bg-muted rounded" />
        <div className="w-6 h-6 bg-muted rounded" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="flex gap-2">
          <div className="w-20 h-4 bg-muted rounded-full" />
          <div className="w-24 h-4 bg-muted rounded-full" />
        </div>
        <div className="w-2/3 h-6 bg-muted rounded" />
        <div className="space-y-2">
          <div className="w-full h-4 bg-muted rounded" />
          <div className="w-full h-4 bg-muted rounded" />
          <div className="w-4/5 h-4 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="w-16 h-6 bg-muted rounded-full" />
          <div className="w-24 h-6 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function PostFeed({ user }: { user: { id: string } }) {
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

    const { data } = await query
    if (data) setPosts(data as unknown as Post[])
    setLoading(false)
  }, [search, subjectFilter, supabase])

  const fetchPostsRef = useRef(fetchPosts)
  useEffect(() => {
    fetchPostsRef.current = fetchPosts
  }, [fetchPosts])

  useEffect(() => {
    setTimeout(() => {
      fetchPosts()
    }, 0)
  }, [fetchPosts])

  useEffect(() => {
    // Realtime for posts, votes and comments
    const channel = supabase
      .channel('public:feed_changes')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'posts' }, () => {
        fetchPostsRef.current()
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'votes' }, () => {
        fetchPostsRef.current()
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'comments' }, () => {
        fetchPostsRef.current()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-6 pb-20">
      <CreatePost user={user} onPostCreated={fetchPosts} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-2xl shadow-md border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-foreground placeholder:text-muted-foreground transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Matière..."
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-foreground placeholder:text-muted-foreground transition-all"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PostCard post={post} currentUser={user} onUpdate={fetchPosts} />
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
              <div className="bg-muted/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Aucune publication trouvée.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Essayez de modifier vos filtres.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
