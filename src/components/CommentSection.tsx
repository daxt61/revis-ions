'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'
import { Comment, Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { User } from '@supabase/supabase-js'

export default function CommentSection({ post, currentUser }: { post: Post, currentUser: User }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchCommentsRef = useRef<() => Promise<void>>(async () => {})

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (data) setComments(data as any[])
  }, [supabase, post.id])

  useEffect(() => {
    fetchCommentsRef.current = fetchComments
  }, [fetchComments])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchComments()
    }, 0)

    const channel = supabase
      .channel(`post_comments_${post.id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        void fetchCommentsRef.current()
      })
      .subscribe()

    return () => {
      clearTimeout(timer)
      void supabase.removeChannel(channel)
    }
  }, [supabase, post.id, fetchComments])

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
    <div className="mt-6 pt-6 border-t border-border space-y-5">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0 border border-primary/20">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-muted/50 rounded-2xl p-3 flex-1 border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-2 italic">Aucun commentaire pour le moment.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground/50 transition-all"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-2 rounded-xl disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/20"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
