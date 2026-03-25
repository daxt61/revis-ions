'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen } from 'lucide-react'
import CommentSection from './CommentSection'
import { type Post, type Vote } from '@/utils/types'
import { type User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PostCard({ post, currentUser, onUpdate }: { post: Post, currentUser: User, onUpdate: () => void }) {
  const [voting, setVoting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const supabase = createClient()

  const userVote = post.votes?.find((v: Vote) => v.user_id === currentUser.id)?.value || 0
  const score = post.votes?.reduce((acc: number, v: Vote) => acc + v.value, 0) || 0

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
    <div className={`bg-card rounded-2xl border border-border overflow-hidden flex ${isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-primary'}`}>
      {/* Vote Sidebar */}
      <div className="bg-background/50 w-12 flex flex-col items-center py-2 gap-1 border-r border-border">
        <button
          onClick={() => {
            void handleVote(1)
          }}
          className={`p-1 rounded transition-colors ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted hover:bg-white/5'}`}
        >
          <ArrowBigUp size={24} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-bold ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-foreground'}`}>
          {score}
        </span>
        <button
          onClick={() => {
            void handleVote(-1)
          }}
          className={`p-1 rounded transition-colors ${userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted hover:bg-white/5'}`}
        >
          <ArrowBigDown size={24} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
            isNoublionsPas ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'
          }`}>
            {post.type}
          </span>
          <span className="text-xs text-muted">•</span>
          <span className="text-xs text-muted">
            Posté par <span className="font-semibold text-foreground/80">{post.profiles?.username || 'Anonyme'}</span>
          </span>
          <span className="text-xs text-muted">•</span>
          <span className="text-xs text-muted">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1">{post.title}</h3>
        {post.description && (
          <p className="text-muted text-sm mb-4 line-clamp-3 whitespace-pre-wrap">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-xs bg-white/5 text-muted px-2 py-1 rounded-md border border-border">
              <BookOpen size={14} />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-md font-medium border border-red-500/20">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt="post image"
                className="w-full aspect-square object-cover rounded-xl border border-border shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-2 border-t border-border mt-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors text-sm font-medium ${
              showComments ? 'text-primary bg-primary/10' : 'text-muted hover:bg-white/5'
            }`}
          >
            <MessageCircle size={18} />
            {post.comments ? (post.comments[0]?.count || 0) : 0} Commentaires
          </button>
        </div>

        {showComments && (
          <CommentSection post={post} currentUser={currentUser} />
        )}
      </div>
    </div>
  )
}
