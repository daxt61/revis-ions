'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, User } from 'lucide-react'
import CommentSection from './CommentSection'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PostCard({ post, currentUser, onUpdate }: { post: any, currentUser: any, onUpdate: () => void }) {
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
    <div className={`bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden flex flex-col sm:flex-row group transition-all hover:border-primary/30 ${isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-primary'}`}>
      {/* Vote Sidebar - Desktop */}
      <div className="bg-secondary/30 w-12 hidden sm:flex flex-col items-center py-4 gap-2 border-r border-border/50">
        <button
          onClick={() => { void handleVote(1) }}
          className={`p-1.5 rounded-xl transition-all hover:scale-110 active:scale-90 ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
        >
          <ArrowBigUp size={24} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          {score}
        </span>
        <button
          onClick={() => { void handleVote(-1) }}
          className={`p-1.5 rounded-xl transition-all hover:scale-110 active:scale-90 ${userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
        >
          <ArrowBigDown size={24} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${
            isNoublionsPas ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {post.type}
          </span>
          <span className="text-muted-foreground/30">•</span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-[10px] font-bold text-primary border border-border/50">
              {post.profiles?.username?.charAt(0).toUpperCase() || <User size={10} />}
            </div>
            <span className="font-semibold text-foreground/80">{post.profiles?.username || 'Anonyme'}</span>
          </div>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-[11px] text-muted-foreground font-medium">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
        {post.description && (
          <p className="text-muted-foreground text-sm mb-5 leading-relaxed whitespace-pre-wrap">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-5">
          {post.subject && (
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider bg-secondary/50 text-muted-foreground px-3 py-1.5 rounded-xl border border-border/50">
              <BookOpen size={14} className="text-primary" />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive px-3 py-1.5 rounded-xl border border-destructive/20">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-6 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <div key={i} className="relative group/img aspect-video sm:aspect-square overflow-hidden rounded-2xl border border-border/50 shadow-lg">
                 <img
                  src={img}
                  alt="post image"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110 cursor-pointer"
                  onClick={() => window.open(img, '_blank')}
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all text-sm font-bold ${
              showComments ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <MessageCircle size={18} />
            <span>{post.comments[0]?.count || 0} Commentaires</span>
          </button>

          {/* Mobile Vote Controls */}
          <div className="flex sm:hidden items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border/50">
             <button
              onClick={() => { void handleVote(1) }}
              className={`p-1.5 rounded-lg transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground'}`}
            >
              <ArrowBigUp size={20} fill={userVote === 1 ? 'currentColor' : 'none'} />
            </button>
            <span className="text-xs font-black min-w-[1.5rem] text-center">
              {score}
            </span>
            <button
              onClick={() => { void handleVote(-1) }}
              className={`p-1.5 rounded-lg transition-all ${userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
            >
              <ArrowBigDown size={20} fill={userVote === -1 ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-border/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <CommentSection post={post} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  )
}
