'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'

export default function CommentSection({ post, currentUser }: { post: any, currentUser: any }) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
  }, [post.id, supabase])

  useEffect(() => {
    void fetchComments()

    const channel = supabase
      .channel(`post_comments_${post.id}`)
      .on('postgres_changes' as any, { event: '*', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        void fetchComments()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [post.id, supabase, fetchComments])

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
    <div className="mt-4 pt-4 border-t border-border space-y-4">
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <div className="w-8 h-8 bg-muted/10 rounded-full flex items-center justify-center text-[10px] font-bold text-muted shrink-0 border border-border">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-muted/5 rounded-2xl p-3 flex-1 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted">{new Date(comment.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="text-sm text-muted">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-muted/5 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-2 rounded-xl disabled:opacity-50 transition-all hover:bg-primary/90 shadow-sm active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
