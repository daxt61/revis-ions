'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, User } from 'lucide-react'
import type { Post, Comment } from '@/types/database'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function CommentSection({ post, currentUser }: { post: Post, currentUser: SupabaseUser }) {
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
    if (data) setComments(data as Comment[])
  }, [post.id, supabase])

  useEffect(() => {
    void fetchComments()
  }, [fetchComments])

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
    <div className="space-y-4">
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 items-start group">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border group-hover:border-primary/50 transition-colors">
              <User size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-foreground">
                  {comment.profiles?.username || 'Anonyme'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                  • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/50 p-2 rounded-xl border border-transparent hover:border-border transition-all">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center py-4 text-xs text-muted-foreground italic font-medium">
            Aucun commentaire pour le moment.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/20 active:scale-95 flex items-center justify-center w-10 h-10 shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
