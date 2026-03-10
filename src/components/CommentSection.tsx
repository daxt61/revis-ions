'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'
import { Post, Comment } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function CommentSection({ post, currentUser }: { post: Post, currentUser: User }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const fetchRef = useRef<(() => Promise<void>) | null>(null)

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if (data) setComments(data as any)
  }, [supabase, post.id])

  useEffect(() => {
    fetchRef.current = fetchComments
  }, [fetchComments])

  useEffect(() => {
    void fetchComments()

    const channel = supabase
      .channel(`post_comments_${post.id}`)
      .on('postgres_changes' as any, { event: '*', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        if (fetchRef.current) void fetchRef.current()
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
      void fetchComments()
    }
    setLoading(false)
  }

  return (
    <div className="mt-5 pt-5 border-t border-border space-y-5 animate-in fade-in slide-in-from-top-2">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center text-xs font-bold text-muted-foreground border border-border shrink-0">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-muted/50 rounded-2xl p-3 flex-1 border border-border/50">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-xs font-bold text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed px-1">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center py-4 text-xs text-muted-foreground italic">Soyez le premier à commenter !</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 group">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground p-2 rounded-xl disabled:opacity-50 transition-all shadow-sm"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
