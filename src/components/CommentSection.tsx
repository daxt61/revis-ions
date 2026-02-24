'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useCallback } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CommentSection({ post, currentUser }: { post: any, currentUser: User }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const timer = setTimeout(() => {
      void fetchComments()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchComments])

  useEffect(() => {
    const channel = supabase
      .channel(`post_comments_${post.id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        void fetchComments()
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
      fetchComments()
    }
    setLoading(false)
  }

  return (
    <div className="mt-6 pt-6 border-t border-border space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center text-xs font-black text-muted-foreground shrink-0 border border-border">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-muted/30 rounded-2xl p-4 flex-1 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Soyez le premier à commenter
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Votre commentaire..."
            className="w-full bg-muted/50 border border-transparent rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground transition-all"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-2.5 rounded-xl disabled:opacity-50 transition-all hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
