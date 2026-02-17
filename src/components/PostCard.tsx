'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen } from 'lucide-react'
import CommentSection from './CommentSection'
import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { User } from '@supabase/supabase-js'

export default function PostCard({ post, currentUser, onUpdate }: { post: Post, currentUser: User, onUpdate: () => void }) {
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
    <div className={`bg-card rounded-3xl shadow-lg border border-border overflow-hidden flex transition-all hover:border-primary/30 ${isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-primary'}`}>
      {/* Vote Sidebar */}
      <div className="bg-muted/30 w-14 flex flex-col items-center py-4 gap-2 border-r border-border">
        <button
          onClick={() => handleVote(1)}
          className={`p-1.5 rounded-xl transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:bg-muted'}`}
        >
          <ArrowBigUp size={26} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-base font-bold ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-foreground'}`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`p-1.5 rounded-xl transition-all ${userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
        >
          <ArrowBigDown size={26} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
            isNoublionsPas ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {isNoublionsPas ? "N&apos;oublions pas" : "Revis-ions"}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            Posté par <span className="font-semibold text-foreground">{post.profiles?.username || 'Anonyme'}</span>
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">{post.title}</h3>
        {post.description && (
          <p className="text-muted-foreground text-sm mb-5 line-clamp-4 whitespace-pre-wrap leading-relaxed">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full border border-border">
              <BookOpen size={14} />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-full border border-destructive/20 font-medium">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-5 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-2xl border border-border shadow-md group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt="post image"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                  onClick={() => window.open(img, '_blank')}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-border mt-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-semibold ${
              showComments ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <MessageCircle size={18} />
            {post.comments?.[0]?.count || 0} Commentaires
          </button>
        </div>

        {showComments && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <CommentSection post={post} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  )
}
