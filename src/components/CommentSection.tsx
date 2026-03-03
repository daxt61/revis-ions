'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, User, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Profile {
  username: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  content: string;
  profiles: Profile | null;
}

interface UserAuth {
  id: string;
}

export default function CommentSection({ post, currentUser }: { post: { id: string }, currentUser: UserAuth }) {
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
    if (data) setComments(data as unknown as Comment[])
  }, [supabase, post.id])

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

  const deleteComment = async (id: string) => {
    if (!confirm('Voulez-vous supprimer ce commentaire ?')) return
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (!error) void fetchComments()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <div className="flex-shrink-0">
              <div className="w-9 h-9 bg-muted/10 rounded-full flex items-center justify-center border border-border/50 shadow-sm transition-colors group-hover:border-primary/30">
                <User size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-black text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </span>
                {comment.user_id === currentUser.id && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all hover:scale-110"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="bg-background/40 p-4 rounded-2xl rounded-tl-none border border-border/30 text-sm text-foreground/90 shadow-sm leading-relaxed">
                {comment.content}
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center py-6 text-sm text-muted-foreground font-medium bg-muted/5 rounded-2xl border border-dashed border-border/50">
            Aucun commentaire pour le moment. Soyez le premier à réagir !
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative mt-8 group">
        <textarea
          placeholder="Ajouter un commentaire..."
          className="w-full bg-background border border-border/50 rounded-2xl p-4 pr-14 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[100px] resize-none shadow-inner"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="absolute right-3 bottom-3 p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
