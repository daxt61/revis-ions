'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, User as UserIcon, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Post, Comment } from '@/utils/types'
import type { User } from '@supabase/supabase-js'

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
    if (data) setComments(data as Comment[])
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
    <div className="mt-6 pt-6 border-t border-border space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group animate-in fade-in slide-in-from-left-2 transition-all">
            <div className="w-8 h-8 bg-white/5 rounded-xl border border-border flex items-center justify-center text-xs font-black text-muted group-hover:text-primary group-hover:border-primary/30 transition-colors shadow-inner shrink-0">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-4 flex-1 border border-border shadow-sm group-hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted font-bold">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}</span>
              </div>
              <p className="text-sm text-muted group-hover:text-foreground transition-colors leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-4 text-muted text-xs font-medium italic border border-dashed border-border rounded-xl">
            Pas encore de commentaires... Soyez le premier !
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 pt-2">
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Écrire un commentaire..."
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted/60 text-foreground"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/20 group-focus-within:text-primary/20 transition-colors" size={16} />
        </div>
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary/10 text-primary hover:bg-primary hover:text-white p-2.5 rounded-xl disabled:opacity-50 transition-all active:scale-95 shadow-sm hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center shrink-0"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>
    </div>
  )
}
