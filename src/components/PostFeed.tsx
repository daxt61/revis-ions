'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { Search, Filter } from 'lucide-react'
import { type User } from '@supabase/supabase-js'

export default function PostFeed({ user }: { user: User }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const supabase = createClient()
  const fetchRef = useRef<() => Promise<void>>(null)

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
  }, [search, subjectFilter, supabase])

  useEffect(() => {
    fetchRef.current = fetchPosts
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPosts()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchPosts])

  useEffect(() => {
    // Realtime for new posts
    const channel = supabase
      .channel('public:posts')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'posts' }, () => {
        if (fetchRef.current) void fetchRef.current()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-6 pb-20">
      <CreatePost user={user} onPostCreated={() => void fetchPosts()} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-2xl shadow-sm border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm text-gray-200 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Matière..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm text-gray-200 outline-none"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 h-48 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-4 bg-gray-800 rounded"></div>
                <div className="w-24 h-4 bg-gray-800 rounded"></div>
              </div>
              <div className="w-2/3 h-6 bg-gray-800 rounded mb-4"></div>
              <div className="w-full h-4 bg-gray-800 rounded mb-2"></div>
              <div className="w-5/6 h-4 bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={() => void fetchPosts()} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-300">Aucun résultat</h3>
              <p className="text-gray-500 mt-1">Essayez d&apos;ajuster vos filtres de recherche.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
