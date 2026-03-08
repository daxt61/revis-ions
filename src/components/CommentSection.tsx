'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { User } from '@supabase/supabase-js'
import { Post, Comment } from '@/types/database'

export default function CommentSection({ post, currentUser }: { post: Post, currentUser: User }) {
  const [comments, setComments] = useState<Comment[]>([])
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
    if (data) setComments(data as any)
  }, [supabase, post.id])

  useEffect(() => {
    fetchCommentsRef.current = fetchComments
  }, [fetchComments])

  useEffect(() => {
    void fetchComments()
  }, [fetchComments])

  useEffect(() => {
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
      void fetchComments()
    }
    setLoading(false)
  }

  return (
    <div className="mt-6 pt-6 border-t border-border space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center text-[10px] font-black text-primary shrink-0 group-hover:border-primary/30 transition-colors">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-background/50 border border-border rounded-2xl px-4 py-3 flex-1 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-foreground tracking-tight">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted italic">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-xs text-muted italic py-2">Aucun commentaire pour le moment. Lancez la discussion !</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 items-center pt-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Écrire un commentaire pertinent..."
            className="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted/50"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-90 shadow-lg shadow-primary/20"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
