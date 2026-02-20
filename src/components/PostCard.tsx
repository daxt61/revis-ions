'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, MoreHorizontal } from 'lucide-react'
import CommentSection from './CommentSection'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { User } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PostCard({ post, currentUser, onUpdate }: { post: any, currentUser: User, onUpdate: () => void }) {
  const [voting, setVoting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userVote = post.votes?.find((v: any) => v.user_id === currentUser.id)?.value || 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const score = post.votes?.reduce((acc: number, v: any) => acc + v.value, 0) || 0

  const handleVote = useCallback(async (value: number) => {
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
  }, [voting, userVote, currentUser.id, post.id, onUpdate, supabase])

  const isNoublionsPas = post.type === "n'oublions pas"

  return (
    <div className={`bg-card rounded-2xl shadow-lg border border-border overflow-hidden flex transition-all hover:border-foreground/10 ${isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-blue-500'}`}>
      {/* Vote Sidebar */}
      <div className="bg-background/50 w-14 flex flex-col items-center py-4 gap-2 border-r border-border">
        <button
          onClick={() => void handleVote(1)}
          className={`p-1.5 rounded-lg transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-foreground/30 hover:bg-foreground/5 hover:text-foreground/60'}`}
        >
          <ArrowBigUp size={28} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-foreground/60'}`}>
          {score}
        </span>
        <button
          onClick={() => void handleVote(-1)}
          className={`p-1.5 rounded-lg transition-all ${userVote === -1 ? 'text-blue-500 bg-blue-500/10' : 'text-foreground/30 hover:bg-foreground/5 hover:text-foreground/60'}`}
        >
          <ArrowBigDown size={28} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
              isNoublionsPas ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
              {post.type}
            </span>
            <span className="text-[10px] text-foreground/20">•</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-foreground/5 rounded-full flex items-center justify-center text-[10px] font-bold text-foreground/60">
                {post.profiles?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-xs font-bold text-foreground/70">{post.profiles?.username || 'Anonyme'}</span>
            </div>
            <span className="text-[10px] text-foreground/20">•</span>
            <span className="text-xs text-foreground/40 font-medium">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
            </span>
          </div>
          <button className="text-foreground/20 hover:text-foreground/60 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <h3 className="text-lg font-black text-foreground mb-2 leading-tight">{post.title}</h3>
        {post.description && (
          <p className="text-foreground/60 text-sm mb-5 line-clamp-4 whitespace-pre-wrap leading-relaxed">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold bg-foreground/5 text-foreground/60 px-2.5 py-1 rounded-lg border border-foreground/5">
              <BookOpen size={14} className="text-blue-500" />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold bg-red-500/10 text-red-500 px-2.5 py-1 rounded-lg border border-red-500/10">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-5 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-border shadow-sm group relative">
                <img
                  src={img}
                  alt="post image"
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold ${
              showComments ? 'text-blue-500 bg-blue-500/10' : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            <MessageCircle size={18} />
            {post.comments[0]?.count || 0} <span className="hidden sm:inline">Commentaires</span>
          </button>
        </div>

        {showComments && (
          <CommentSection post={post} currentUser={currentUser} />
        )}
      </div>
    </div>
  )
}
