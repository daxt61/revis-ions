'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, User as UserIcon } from 'lucide-react'
import { Comment, Post } from '@/utils/types'
import { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function CommentSection({ post, currentUser }: { post: Post, currentUser: User }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const fetchCommentsRef = useRef<() => Promise<void>>(async () => {})
  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if (data) setComments(data as any)
  }, [post.id, supabase])

  useEffect(() => {
    fetchCommentsRef.current = fetchComments
  }, [fetchComments])

  useEffect(() => {
    void fetchComments()

    const channel = supabase
      .channel(`post_comments_${post.id}`)
      .on('postgres_changes' as any, {
        event: '*',
        table: 'comments',
        filter: `post_id=eq.${post.id}`
      }, () => {
        void fetchCommentsRef.current()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [post.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setLoading(true)

    const { error } = await supabase.from('comments').insert({
      user_id: currentUser.id,
      post_id: post.id,
      content: newComment,
    })

    if (!error) {
      setNewComment('')
      void fetchComments()
    }
    setLoading(false)
  }

  return (
    <div className="mt-6 pt-6 border-t border-white/5 space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group/comment">
            <div className="w-8 h-8 bg-gray-800 border border-white/5 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 group-hover/comment:border-blue-500/20 transition-all shrink-0 shadow-sm">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-gray-950/40 rounded-2xl p-4 flex-1 border border-white/5 group-hover/comment:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-blue-400 group-hover/comment:text-blue-300 transition-colors">
                  {comment.profiles?.username || 'Anonyme'}
                </span>
                <span className="text-[10px] text-gray-500 italic">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-xs text-gray-600 italic py-4">Soyez le premier à commenter !</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 sticky bottom-0 bg-gray-900/10 backdrop-blur-md pt-2">
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Écrire une réponse brillante..."
            className="w-full bg-gray-950/60 border border-white/10 rounded-xl px-5 py-3 text-sm text-gray-200 placeholder-gray-700 focus:border-blue-500/50 focus:ring-0 transition-all"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/10 active:scale-95"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  )
}
