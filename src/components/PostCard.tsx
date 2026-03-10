'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen } from 'lucide-react'
import CommentSection from './CommentSection'
import { Post } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PostCard({ post, currentUser, onUpdate }: { post: Post, currentUser: User, onUpdate: () => void }) {
  const [voting, setVoting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const supabase = createClient()

  const userVote = post.votes?.find((v) => v.user_id === currentUser.id)?.value || 0
  const score = post.votes?.reduce((acc, v) => acc + v.value, 0) || 0

  const handleVote = async (value: number) => {
    if (voting) return
    setVoting(true)

    try {
      if (userVote === value) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .match({ user_id: currentUser.id, post_id: post.id })
      } else {
        // Upsert vote
        await supabase
          .from('votes')
          .upsert({ user_id: currentUser.id, post_id: post.id, value })
      }
      onUpdate()
    } catch (error) {
      console.error(error)
    } finally {
      setVoting(false)
    }
  }

  const isNoublionsPas = post.type === "n'oublions pas"

  return (
    <div className={`bg-card rounded-2xl shadow-xl border border-border overflow-hidden flex transition-all hover:border-primary/50 group ${isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-primary'}`}>
      {/* Vote Sidebar */}
      <div className="bg-muted/30 w-12 flex flex-col items-center py-4 gap-2 border-r border-border">
        <button
          onClick={() => void handleVote(1)}
          disabled={voting}
          className={`p-1.5 rounded-lg transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          <ArrowBigUp size={24} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black tracking-tighter ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          {score}
        </span>
        <button
          onClick={() => void handleVote(-1)}
          disabled={voting}
          className={`p-1.5 rounded-lg transition-all ${userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          <ArrowBigDown size={24} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider ${
            isNoublionsPas ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {post.type}
          </span>
          <span className="text-xs text-muted-foreground/30">•</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-muted rounded-md flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              {post.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-xs font-bold text-foreground">
              {post.profiles?.username || 'Anonyme'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
        {post.description && (
          <p className="text-muted-foreground text-sm mb-5 line-clamp-4 whitespace-pre-wrap leading-relaxed">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-5">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold bg-muted text-muted-foreground px-2.5 py-1 rounded-lg border border-border">
              <BookOpen size={14} />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-[11px] font-black bg-destructive/10 text-destructive px-2.5 py-1 rounded-lg border border-destructive/20 uppercase tracking-tight">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-5 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <div key={i} className="relative group/img overflow-hidden rounded-xl border border-border aspect-square">
                <img
                  src={img}
                  alt="post image"
                  className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
                  onClick={() => window.open(img, '_blank')}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-border mt-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${
              showComments ? 'text-primary bg-primary/10 border border-primary/20' : 'text-muted-foreground hover:bg-muted border border-transparent'
            }`}
          >
            <MessageCircle size={18} />
            {post.comments?.[0]?.count || 0} Commentaires
          </button>
        </div>

        {showComments && (
          <CommentSection post={post} currentUser={currentUser} />
        )}
      </div>
    </div>
  )
}
