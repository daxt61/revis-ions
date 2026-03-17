'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, User as UserIcon } from 'lucide-react'
import { Post, Comment } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function CommentSection({ post, currentUser }: { post: Post, currentUser: User }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if (data) setComments(data as any)
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
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 bg-background border border-border rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm">
              <UserIcon size={14} className="text-muted" />
            </div>
            <div className="bg-background border border-border rounded-2xl p-4 flex-1 shadow-sm group-hover:border-muted/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-foreground tracking-tight">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground/80 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="py-2 text-center">
            <p className="text-xs text-muted font-bold uppercase tracking-widest">Soyez le premier à commenter</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 pt-4 sticky bottom-0 bg-card pb-2">
        <input
          type="text"
          placeholder="Écrire un commentaire..."
          className="flex-1 bg-background border border-border rounded-2xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-foreground transition-all shadow-sm"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-2.5 rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/10 active:scale-95"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
