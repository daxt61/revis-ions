'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { type User as SupabaseUser } from '@supabase/supabase-js'
import { Post, Comment } from '@/types'

export default function CommentSection({ post, currentUser }: { post: Post, currentUser: SupabaseUser }) {
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
    if (data) setComments(data)
  }, [supabase, post.id])

  useEffect(() => {
    fetchCommentsRef.current = fetchComments
  }, [fetchComments])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchComments()

    const channel = supabase
      .channel(`post_comments_${post.id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        if (fetchCommentsRef.current) {
          void fetchCommentsRef.current()
        }
      })
      .subscribe()

    return () => {
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
      fetchComments()
    }
    setLoading(false)
  }

  return (
    <div className="mt-6 pt-6 border-t border-border/50 space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center text-[10px] font-black text-primary border border-border/50 shrink-0 group-hover:scale-110 transition-transform">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-secondary/30 rounded-2xl p-3 flex-1 border border-border/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black italic text-foreground/90">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 py-4">Silence radio... Soyez le premier !</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 group">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Écrire un petit mot..."
            className="w-full bg-secondary/50 border border-border/50 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:italic"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-2.5 rounded-2xl disabled:opacity-50 transition-all hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-90"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
