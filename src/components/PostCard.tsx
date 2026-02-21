'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, Share2 } from 'lucide-react'
import CommentSection from './CommentSection'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { User } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PostCard({ post, currentUser, onUpdate }: { post: any, currentUser: User, onUpdate: () => void }) {
  const [voting, setVoting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userVote = post.votes?.find((v: any) => v.user_id === currentUser.id)?.value || 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className={`bg-card rounded-3xl shadow-lg border border-border overflow-hidden flex transition-all hover:shadow-primary/5 ${
      isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-primary'
    }`}>
      {/* Vote Sidebar */}
      <div className="bg-background/50 w-14 flex flex-col items-center py-4 gap-1 border-r border-border">
        <button
          onClick={() => void handleVote(1)}
          className={`p-1.5 rounded-xl transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted hover:bg-muted/10 hover:text-foreground'}`}
        >
          <ArrowBigUp size={28} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-foreground'}`}>
          {score}
        </span>
        <button
          onClick={() => void handleVote(-1)}
          className={`p-1.5 rounded-xl transition-all ${userVote === -1 ? 'text-blue-500 bg-blue-500/10' : 'text-muted hover:bg-muted/10 hover:text-foreground'}`}
        >
          <ArrowBigDown size={28} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
            isNoublionsPas ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'
          }`}>
            {post.type}
          </span>
          <span className="text-xs text-muted">•</span>
          <span className="text-xs text-muted">
            Par <span className="font-bold text-foreground">{post.profiles?.username || 'Anonyme'}</span>
          </span>
          <span className="text-xs text-muted">•</span>
          <span className="text-xs text-muted" title={new Date(post.created_at).toLocaleString()}>
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-foreground mb-2 leading-tight">{post.title}</h3>
        {post.description && (
          <p className="text-muted text-sm mb-5 line-clamp-4 whitespace-pre-wrap leading-relaxed">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-xs bg-muted/10 text-muted px-3 py-1.5 rounded-xl font-semibold border border-muted/20">
              <BookOpen size={14} />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-500 px-3 py-1.5 rounded-xl font-bold border border-red-500/20">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-5 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <div key={i} className="relative group overflow-hidden rounded-2xl border border-border aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt="post content"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                  onClick={() => window.open(img, '_blank')}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold ${
              showComments ? 'text-primary bg-primary/10' : 'text-muted hover:bg-muted/10 hover:text-foreground'
            }`}
          >
            <MessageCircle size={18} />
            {post.comments[0]?.count || 0} <span className="hidden sm:inline">Commentaires</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold text-muted hover:bg-muted/10 hover:text-foreground">
            <Share2 size={18} />
            <span className="hidden sm:inline">Partager</span>
          </button>
        </div>

        {showComments && (
          <CommentSection post={post} currentUser={currentUser} />
        )}
      </div>
    </div>
  )
}
