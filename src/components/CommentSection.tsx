'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, Clock, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

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
    <div className="mt-6 pt-6 border-t border-border space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-primary" />
        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Commentaires</h4>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center text-xs font-black text-muted-foreground border border-border group-hover:border-primary/30 transition-colors shrink-0 overflow-hidden">
               {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-secondary/50 rounded-2xl p-4 flex-1 border border-border group-hover:border-primary/20 transition-all hover:bg-secondary">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1">
                  <Clock size={10} />
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">{comment.content}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-xs text-center py-4 text-muted-foreground font-bold italic">Soyez le premier à commenter !</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 pt-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Ajouter une réflexion..."
            className="w-full bg-secondary/50 border border-border/50 rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-secondary outline-none transition-all placeholder:text-muted-foreground/50"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-3.5 rounded-2xl hover:bg-primary/80 disabled:opacity-50 transition-all shadow-xl shadow-primary/10 active:scale-95 flex items-center justify-center shrink-0"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  )
}
