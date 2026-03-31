'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, ExternalLink, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import CommentSection from './CommentSection'
import type { Post } from '@/utils/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function PostCard({ post, currentUser, onUpdate }: { post: Post, currentUser: SupabaseUser, onUpdate: () => void }) {
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
    <div className={`bg-card/50 backdrop-blur-md rounded-2xl shadow-xl border-l-4 overflow-hidden flex transition-all hover:border-l-8 duration-300 ${
      isNoublionsPas ? 'border-orange-500 hover:bg-orange-500/5' : 'border-primary hover:bg-primary/5'
    } border-t border-r border-b border-border`}>
      {/* Vote Sidebar */}
      <div className="bg-background/30 w-14 flex flex-col items-center py-4 gap-2 border-r border-border shadow-inner">
        <button
          onClick={() => handleVote(1)}
          className={`p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${
            userVote === 1 ? 'text-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20' : 'text-muted hover:bg-white/5 hover:text-foreground'
          }`}
        >
          <ArrowBigUp size={28} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black tabular-nums transition-colors ${
          score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-muted'
        }`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${
            userVote === -1 ? 'text-primary bg-primary/10 shadow-lg shadow-primary/20' : 'text-muted hover:bg-white/5 hover:text-foreground'
          }`}
        >
          <ArrowBigDown size={28} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${
            isNoublionsPas ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-primary/20 text-primary border border-primary/30'
          }`}>
            {post.type}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted font-medium">
            <div className="w-5 h-5 bg-white/5 rounded-full flex items-center justify-center border border-border">
              <User size={12} className="text-muted/60" />
            </div>
            <span>{post.profiles?.username || 'Anonyme'}</span>
            <span className="opacity-40">•</span>
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</span>
          </div>
        </div>

        <h3 className="text-xl font-black text-foreground mb-2 leading-tight tracking-tight">{post.title}</h3>
        {post.description && (
          <p className="text-muted text-sm mb-6 leading-relaxed whitespace-pre-wrap line-clamp-4">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-6">
          {post.subject && (
            <div className="flex items-center gap-2 text-xs bg-white/5 text-foreground px-3 py-1.5 rounded-xl border border-border shadow-sm">
              <BookOpen size={14} className="text-primary" />
              <span className="font-bold">{post.subject}</span>
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-2 text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-xl border border-red-500/20 shadow-sm font-black">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-6 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <div key={i} className="relative group cursor-pointer overflow-hidden rounded-2xl border border-border shadow-md" onClick={() => window.open(img, '_blank')}>
                <img
                  src={img}
                  alt="post image"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="text-white" size={20} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-5 border-t border-border">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all text-sm font-black tracking-tight ${
              showComments ? 'text-primary bg-primary/10 shadow-inner' : 'text-muted hover:text-foreground hover:bg-white/5'
            }`}
          >
            <MessageCircle size={20} />
            {post.comments?.[0]?.count || 0} Commentaires
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
