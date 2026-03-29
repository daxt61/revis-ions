'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter, Sparkles } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { Post } from '@/utils/types'

export default function PostFeed({ user }: { user: User }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const fetchPostsRef = useRef<() => Promise<void>>(async () => {})
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
    if (data) setPosts(data as any)
    setLoading(false)
  }, [supabase, search, subjectFilter])

  useEffect(() => {
    fetchPostsRef.current = fetchPosts
  }, [fetchPosts])

  useEffect(() => {
    void fetchPosts()
  }, [fetchPosts])

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
    <div className="space-y-8 pb-20">
      <CreatePost user={user} onPostCreated={() => void fetchPosts()} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Rechercher une pépite..."
            className="w-full pl-12 pr-4 py-3 bg-gray-950/50 border border-white/5 rounded-xl focus:border-blue-500/50 focus:ring-0 text-sm text-gray-200 placeholder-gray-600 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-56 group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Filtrer par matière..."
            className="w-full pl-12 pr-4 py-3 bg-gray-950/50 border border-white/5 rounded-xl focus:border-indigo-500/50 focus:ring-0 text-sm text-gray-200 placeholder-gray-600 transition-all"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400/50" size={16} />
          </div>
          <p className="text-gray-500 font-medium animate-pulse">Chargement du Hub...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={() => void fetchPosts()} />
          ))}

          {posts.length === 0 && !loading && (
            <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-900 rounded-full border border-white/5">
                <Search size={32} className="text-gray-700" />
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 font-bold text-lg">Aucune publication trouvée</p>
                <p className="text-gray-600 text-sm">Essayez de modifier vos filtres ou lancez un nouveau sujet !</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
