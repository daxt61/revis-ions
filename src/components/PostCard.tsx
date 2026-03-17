'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, User as UserIcon } from 'lucide-react'
import CommentSection from './CommentSection'
import { Post } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface PostCardProps {
  post: Post
  currentUser: User
  onUpdate: () => void
}

export default function PostCard({ post, currentUser, onUpdate }: PostCardProps) {
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
    <div className={`bg-card rounded-2xl shadow-sm border border-border overflow-hidden flex transition-all hover:border-muted/50 ${
      isNoublionsPas ? 'border-l-4 border-l-accent' : 'border-l-4 border-l-primary'
    }`}>
      {/* Vote Sidebar */}
      <div className="bg-background/50 w-12 flex flex-col items-center py-4 gap-1 border-r border-border">
        <button
          onClick={() => handleVote(1)}
          className={`p-1.5 rounded-lg transition-all ${
            userVote === 1 ? 'text-accent bg-accent/10' : 'text-muted hover:bg-border/50 hover:text-foreground'
          }`}
        >
          <ArrowBigUp size={24} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black ${
          score > 0 ? 'text-accent' : score < 0 ? 'text-primary' : 'text-foreground'
        }`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`p-1.5 rounded-lg transition-all ${
            userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted hover:bg-border/50 hover:text-foreground'
          }`}
        >
          <ArrowBigDown size={24} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
            isNoublionsPas ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {post.type}
          </span>
          <span className="text-muted text-[10px] uppercase font-bold">•</span>
          <div className="flex items-center gap-1.5">
             <div className="w-5 h-5 bg-border rounded-full flex items-center justify-center">
                <UserIcon size={12} className="text-muted" />
             </div>
             <span className="text-xs font-bold text-foreground/90">
               {post.profiles?.username || 'Anonyme'}
             </span>
          </div>
          <span className="text-muted text-[10px] font-bold">•</span>
          <span className="text-[10px] font-medium text-muted">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">{post.title}</h3>
        {post.description && (
          <p className="text-muted text-sm mb-5 leading-relaxed whitespace-pre-wrap">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-5">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-xs bg-background text-foreground/80 px-3 py-1.5 rounded-xl border border-border font-medium">
              <BookOpen size={14} className="text-primary" />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-500 px-3 py-1.5 rounded-xl border border-red-500/20 font-bold">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-5 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-background">
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
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold ${
              showComments ? 'text-primary bg-primary/10' : 'text-muted hover:bg-background hover:text-foreground border border-transparent hover:border-border'
            }`}
          >
            <MessageCircle size={18} />
            {post.comments[0]?.count || 0} Commentaires
          </button>
        </div>

        {showComments && (
          <CommentSection post={post} currentUser={currentUser} />
        )}
      </div>
    </div>
  )
}
