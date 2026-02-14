'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Post, Comment } from '@/types'

export default function CommentSection({ post, currentUser }: { post: Post, currentUser: { id: string } }) {
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
    if (data) setComments(data)
  }, [post.id, supabase])

  useEffect(() => {
    setTimeout(() => {
      fetchComments()
    }, 0)

    const channel = supabase
      .channel(`post_comments_${post.id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        fetchComments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
      fetchComments()
    }
    setLoading(false)
  }

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in fade-in duration-300">
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2 group">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 border border-border">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-muted/30 rounded-2xl px-3 py-2 flex-1 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-primary-foreground p-2 rounded-xl disabled:opacity-50 transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  )
}
