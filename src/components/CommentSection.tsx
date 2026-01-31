'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, User } from 'lucide-react'

export default function CommentSection({ post, currentUser }: { post: any, currentUser: any }) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
  }

  useEffect(() => {
    fetchComments()

    const channel = supabase
      .channel(`post_comments_${post.id}`)
      .on('postgres_changes' as any, { event: '*', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        fetchComments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [post.id])

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
      fetchComments()
    }
    setLoading(false)
  }

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-gray-100 rounded-lg p-2 flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-700">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-600">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
