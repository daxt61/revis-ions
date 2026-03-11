'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Post, Comment } from '@/types/database'
import { User } from '@supabase/supabase-js'

export default function CommentSection({ post, currentUser }: { post: Post, currentUser: User }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if (data) setComments(data as any)
  }, [supabase, post.id])

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
  }, [post.id, fetchComments, supabase])

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
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center text-xs font-bold text-muted shrink-0">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-background/50 border border-border rounded-2xl p-3 flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center py-2 text-xs text-muted italic">Aucun commentaire pour le moment.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white hover:bg-primary/90 p-2 rounded-xl disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-primary/10"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
