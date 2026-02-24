'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen } from 'lucide-react'
import CommentSection from './CommentSection'
import { type User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

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
    <div className={`bg-card rounded-2xl border border-border overflow-hidden flex shadow-lg transition-all hover:shadow-primary/5 hover:border-primary/20 ${isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-primary'}`}>
      {/* Vote Sidebar */}
      <div className="bg-muted/30 w-14 flex flex-col items-center py-4 gap-2 border-r border-border">
        <button
          onClick={() => handleVote(1)}
          className={`p-1.5 rounded-xl transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:bg-muted'}`}
        >
          <ArrowBigUp size={28} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-base font-black ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`p-1.5 rounded-xl transition-all ${userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
        >
          <ArrowBigDown size={28} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mb-4">
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
            isNoublionsPas ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {post.type}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
            <span>Posté par <span className="text-foreground font-bold">{post.profiles?.username || 'Anonyme'}</span></span>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</span>
          </div>
        </div>

        <h3 className="text-xl font-black text-foreground mb-2 leading-tight">{post.title}</h3>
        {post.description && (
          <p className="text-muted-foreground text-sm mb-5 line-clamp-4 whitespace-pre-wrap leading-relaxed">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-6">
          {post.subject && (
            <div className="flex items-center gap-2 text-xs font-bold bg-muted/50 text-foreground px-3 py-1.5 rounded-xl border border-border">
              <BookOpen size={14} className="text-primary" />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-2 text-xs font-bold bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-xl border border-rose-500/20">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-6 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-border shadow-md">
                <img
                  src={img}
                  alt="post image"
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
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all text-sm font-bold ${
              showComments ? 'text-primary bg-primary/10 ring-1 ring-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <MessageCircle size={20} />
            {post.comments[0]?.count || 0} <span className="hidden sm:inline">Commentaires</span>
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
