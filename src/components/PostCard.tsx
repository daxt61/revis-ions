'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import CommentSection from './CommentSection'
import { User } from '@supabase/supabase-js'
import { Post } from '@/types/database'

export default function PostCard({ post, currentUser, onUpdate }: { post: Post, currentUser: User, onUpdate: () => void }) {
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
    <div className={`bg-card rounded-3xl shadow-sm border border-border overflow-hidden flex transition-all hover:shadow-md ${isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-primary'}`}>
      {/* Vote Sidebar */}
      <div className="bg-background/50 w-12 flex flex-col items-center py-4 gap-1 border-r border-border">
        <button
          onClick={() => handleVote(1)}
          className={`p-1 rounded-lg transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted hover:bg-card'}`}
        >
          <ArrowBigUp size={24} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-muted'}`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`p-1 rounded-lg transition-all ${userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted hover:bg-card'}`}
        >
          <ArrowBigDown size={24} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
            isNoublionsPas ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'
          }`}>
            {post.type}
          </span>
          <span className="text-[10px] text-muted font-bold tracking-tight">
            par <span className="text-foreground">{post.profiles?.username || 'Anonyme'}</span>
          </span>
          <span className="text-muted text-[10px]">•</span>
          <span className="text-[10px] text-muted font-medium italic">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <h3 className="text-lg font-black text-foreground mb-2 leading-tight tracking-tight">{post.title}</h3>
        {post.description && (
          <p className="text-muted text-sm mb-4 line-clamp-3 whitespace-pre-wrap leading-relaxed">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-5">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-background border border-border text-muted px-2.5 py-1 rounded-lg">
              <BookOpen size={12} className="text-primary" />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-lg">
              <Calendar size={12} />
              Échéance : {new Date(post.due_date).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-5 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt="post image"
                className="w-full aspect-square object-cover rounded-2xl border border-border shadow-sm cursor-pointer hover:opacity-80 transition-all hover:scale-[1.02]"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-border mt-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${
              showComments ? 'text-primary bg-primary/10' : 'text-muted hover:bg-background'
            }`}
          >
            <MessageCircle size={16} />
            {post.comments && post.comments[0]?.count || 0} Commentaires
          </button>
        </div>

        {showComments && (
          <CommentSection post={post} currentUser={currentUser} />
        )}
      </div>
    </div>
  )
}
