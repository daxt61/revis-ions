'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, User } from 'lucide-react'
import CommentSection from './CommentSection'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { type User as SupabaseUser } from '@supabase/supabase-js'
import { Post } from '@/types'

export default function PostCard({ post, currentUser, onUpdate }: { post: Post, currentUser: SupabaseUser, onUpdate: () => void }) {
  const [voting, setVoting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const supabase = createClient()

  const userVote = post.votes?.find((v) => v.user_id === currentUser.id)?.value || 0
  const score = post.votes?.reduce((acc: number, v) => acc + v.value, 0) || 0

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
    <div className={`group bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden flex transition-all hover:border-border/80 ${
      isNoublionsPas ? 'ring-1 ring-orange-500/20' : 'ring-1 ring-primary/20'
    }`}>
      {/* Vote Sidebar */}
      <div className="bg-secondary/30 w-14 flex flex-col items-center py-4 gap-2 border-r border-border/50">
        <button
          onClick={() => handleVote(1)}
          className={`p-1.5 rounded-xl transition-all ${
            userVote === 1
              ? 'text-orange-500 bg-orange-500/10 shadow-inner'
              : 'text-muted-foreground hover:text-orange-400 hover:bg-secondary'
          }`}
        >
          <ArrowBigUp size={28} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black italic tracking-tighter ${
          score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-muted-foreground'
        }`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`p-1.5 rounded-xl transition-all ${
            userVote === -1
              ? 'text-primary bg-primary/10 shadow-inner'
              : 'text-muted-foreground hover:text-primary hover:bg-secondary'
          }`}
        >
          <ArrowBigDown size={28} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            isNoublionsPas ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isNoublionsPas ? 'bg-orange-500' : 'bg-primary'}`} />
            {post.type}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
              <User size={12} />
            </div>
            <span className="text-xs font-bold italic truncate max-w-[120px]">
              {post.profiles?.username || 'Anonyme'}
            </span>
          </div>

          <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-tighter italic ml-auto">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <h3 className="text-xl font-black text-foreground mb-2 leading-tight tracking-tight group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {post.description && (
          <p className="text-foreground/70 text-sm mb-6 line-clamp-3 whitespace-pre-wrap italic font-medium leading-relaxed">
            &quot;{post.description}&quot;
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-secondary/50 text-muted-foreground px-3 py-1.5 rounded-xl border border-border/30">
              <BookOpen size={14} className="text-primary" />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-destructive/10 text-destructive px-3 py-1.5 rounded-xl border border-destructive/20 shadow-lg shadow-destructive/5">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-6 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border/50 group/img shadow-lg">
                <img
                  src={img}
                  alt="post content"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110 cursor-pointer"
                  onClick={() => window.open(img, '_blank')}
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-border/50">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all text-xs font-black uppercase tracking-widest ${
              showComments
                ? 'text-primary bg-primary/10 shadow-inner'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <MessageCircle size={18} className={showComments ? 'animate-bounce' : ''} />
            {post.comments[0]?.count || 0} Commentaires
          </button>
        </div>

        {showComments && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <CommentSection post={post} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  )
}
