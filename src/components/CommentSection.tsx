'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function CommentSection({ post, currentUser }: { post: any, currentUser: SupabaseUser }) {
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
  }, [post.id, supabase])

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
    <div className="mt-5 pt-5 border-t border-border-border space-y-5 animate-in fade-in duration-300">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 items-start group">
            <div className="w-8 h-8 bg-background border border-border-border rounded-full flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0 shadow-sm">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="bg-background border border-border-border rounded-2xl p-3 flex-1 shadow-sm group-hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground">{comment.profiles?.username || 'Anonyme'}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-xs text-center text-muted-foreground py-4 bg-background/20 rounded-xl border border-dashed border-border-border">
            Aucun commentaire pour le moment.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-background border border-border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-primary text-white p-2 rounded-xl disabled:opacity-50 transition-all hover:bg-blue-600 active:scale-95 shadow-md shadow-primary/20"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
