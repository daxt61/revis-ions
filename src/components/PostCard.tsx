'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, Clock } from 'lucide-react'
import CommentSection from './CommentSection'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { User } from '@supabase/supabase-js'

export default function PostCard({ post, currentUser, onUpdate }: { post: any, currentUser: User, onUpdate: () => void }) {
  const [voting, setVoting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const supabase = createClient()

  const userVote = post.votes?.find((v: any) => v.user_id === currentUser.id)?.value || 0
  const score = post.votes?.reduce((acc: number, v: any) => acc + v.value, 0) || 0

  const handleVote = async (value: number) => {
    if (voting) return
    setVoting(true)

    try {
      if (userVote === value) {
        await supabase
          .from('votes')
          .delete()
          .match({ user_id: currentUser.id, post_id: post.id })
      } else {
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
    <div className={`bg-card rounded-3xl shadow-lg border border-border overflow-hidden flex transition-all hover:border-muted-foreground/30 ${
      isNoublionsPas ? 'border-l-8 border-l-orange-400' : 'border-l-8 border-l-blue-500'
    }`}>
      <div className="bg-muted/30 w-14 flex flex-col items-center py-4 gap-2 border-r border-border">
        <button
          onClick={() => handleVote(1)}
          className={`p-1 rounded-xl transition-all hover:bg-orange-500/10 ${userVote === 1 ? 'text-orange-500 scale-110' : 'text-muted-foreground'}`}
        >
          <ArrowBigUp size={28} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-foreground'}`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`p-1 rounded-xl transition-all hover:bg-blue-500/10 ${userVote === -1 ? 'text-blue-500 scale-110' : 'text-muted-foreground'}`}
        >
          <ArrowBigDown size={28} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex-1 p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider ${
            isNoublionsPas ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
          }`}>
            {post.type}
          </span>
          <span className="text-xs text-muted-foreground/40">•</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
              {post.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-xs font-bold text-foreground/80">{post.profiles?.username || 'Anonyme'}</span>
          </div>
          <span className="text-xs text-muted-foreground/40">•</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </div>
        </div>

        <h3 className="text-xl font-black text-foreground mb-2 leading-tight tracking-tight">{post.title}</h3>
        {post.description && (
          <p className="text-muted-foreground text-sm mb-5 leading-relaxed whitespace-pre-wrap">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-xs bg-muted border border-border text-foreground/70 px-3 py-1.5 rounded-xl font-bold">
              <BookOpen size={14} className="text-primary" />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-xs bg-destructive/10 border border-destructive/20 text-destructive px-3 py-1.5 rounded-xl font-bold">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-5 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt="post image"
                className="w-full aspect-[4/3] object-cover rounded-2xl border border-border shadow-md cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all text-sm font-bold ${
              showComments ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <MessageCircle size={20} />
            {post.comments[0]?.count || 0} Commentaires
          </button>
        </div>

        {showComments && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <CommentSection post={post} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  )
}
