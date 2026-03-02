'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { User } from '@supabase/supabase-js'

export default function CommentSection({ post, currentUser }: { post: any, currentUser: User }) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const fetchCommentsRef = useRef<() => Promise<void>>(null)

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
  }, [supabase, post.id])

  useEffect(() => {
    fetchCommentsRef.current = fetchComments
  }, [fetchComments])

  useEffect(() => {
    if (fetchCommentsRef.current) {
      void fetchCommentsRef.current()
    }

    const channel = supabase
      .channel(`post_comments_${post.id}`)
      .on('postgres_changes' as any, { event: '*', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        if (fetchCommentsRef.current) {
          void fetchCommentsRef.current()
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase, post.id])

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
      if (fetchCommentsRef.current) {
        void fetchCommentsRef.current()
      }
    }
    setLoading(false)
  }

  return (
    <div className="mt-4 pt-6 border-t border-border space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0 border border-primary/20">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-background border border-border rounded-2xl p-3 flex-1 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-sm text-muted py-2 italic">Aucun commentaire pour le moment.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted transition-all"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-2 rounded-xl disabled:opacity-50 transition-all hover:bg-primary/90 shadow-sm"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
