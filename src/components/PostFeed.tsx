'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter, Loader2 } from 'lucide-react'
import type { Post } from '@/utils/types'
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

    const { data } = await query
    if (data) setPosts(data as unknown as Post[])
    setLoading(false)
  }, [supabase, search, subjectFilter])

  useEffect(() => {
    void fetchPosts()

    // Realtime for new posts
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes' as any, { event: '*', table: 'posts' }, () => {
        void fetchPosts()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase, fetchPosts])

  return (
    <div className="space-y-6 pb-20">
      <CreatePost user={user} onPostCreated={fetchPosts} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card/50 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Rechercher une publication..."
            className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-56">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Matière..."
            className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-muted"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-muted text-sm font-medium">Chargement des publications...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={fetchPosts} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-card/30 rounded-2xl border-2 border-dashed border-border shadow-inner">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Search className="text-muted" size={24} />
              </div>
              <p className="text-foreground font-bold mb-1">Aucune publication trouvée</p>
              <p className="text-muted text-sm px-10">Essayez de modifier vos filtres ou de créer un nouveau post !</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
