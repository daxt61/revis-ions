'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { User } from '@supabase/supabase-js'

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

  const fetchCommentsRef = useRef(fetchComments)
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
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 bg-background border border-border rounded-xl flex items-center justify-center text-[10px] font-black text-primary shrink-0 transition-transform group-hover:scale-110">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-background border border-border rounded-2xl p-3 flex-1 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted font-medium">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2 bg-background p-1.5 rounded-2xl border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <input
          type="text"
          placeholder="Ajouter un commentaire constructif..."
          className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:ring-0 outline-none placeholder:text-muted/50 text-foreground"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-2 rounded-xl disabled:opacity-50 transition-all hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
