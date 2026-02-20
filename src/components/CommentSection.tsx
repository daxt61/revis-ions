'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { User } from '@supabase/supabase-js'

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

    const channel = supabase
      .channel(`post_comments_${post.id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        void fetchComments()
      })
      .subscribe()

    return () => {
      clearTimeout(timer)
      void supabase.removeChannel(channel)
    }
  }, [post.id, fetchComments, supabase])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [newComment, currentUser.id, post.id, fetchComments, supabase])

  return (
    <div className="mt-6 pt-6 border-t border-border space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 bg-foreground/5 rounded-full flex items-center justify-center text-xs font-bold text-foreground/40 shrink-0 border border-border group-hover:border-blue-500/30 transition-colors">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-background/50 border border-border rounded-2xl p-3 flex-1 group-hover:border-foreground/10 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground/80">{comment.profiles?.username || 'Anonyme'}</span>
                <div className="flex items-center gap-1 text-[10px] text-foreground/30 font-medium">
                  <Clock size={10} />
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </div>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center py-4 text-xs text-foreground/30 italic">Aucun commentaire pour le moment.</p>
        )}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2 items-center bg-background border border-border rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
        <input
          type="text"
          placeholder="Écrire un commentaire..."
          className="flex-1 bg-transparent border-none px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/20 outline-none focus:ring-0"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-blue-600 text-white p-2 rounded-xl disabled:opacity-30 hover:bg-blue-500 transition-all active:scale-90"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
