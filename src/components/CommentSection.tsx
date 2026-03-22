'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, User as UserIcon, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { User } from '@supabase/supabase-js'

export default function CommentSection({ post, currentUser }: { post: any, currentUser: User }) {
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
      void fetchComments()
    }
    setLoading(false)
  }

  return (
    <div className="mt-6 pt-6 border-t border-border space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group animate-in slide-in-from-left-2 duration-300">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-[10px] font-black text-primary shrink-0 border border-border group-hover:bg-primary/10 transition-colors">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-muted/40 rounded-2xl p-4 flex-1 border border-transparent group-hover:border-border transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                  <Clock size={10} />
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 sticky bottom-4 z-10 p-2 bg-card rounded-2xl border border-border shadow-2xl">
        <input
          type="text"
          placeholder="Écrire un commentaire..."
          className="flex-1 bg-muted border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-primary-foreground p-3 rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-lg"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
