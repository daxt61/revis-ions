'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import CommentSection from './CommentSection'

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
  const relativeDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })

  return (
    <div className={`bg-card rounded-2xl shadow-xl shadow-black/20 border border-border overflow-hidden flex transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5 active:scale-100 ${
      isNoublionsPas ? 'border-l-4 border-l-orange-500/50' : 'border-l-4 border-l-primary/50'
    }`}>
      {/* Vote Sidebar */}
      <div className="bg-secondary/30 w-12 flex flex-col items-center py-4 gap-2 border-r border-border/50">
        <button
          onClick={() => handleVote(1)}
          className={`p-1.5 rounded-lg transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
        >
          <ArrowBigUp size={28} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`p-1.5 rounded-lg transition-all ${userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
        >
          <ArrowBigDown size={28} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
            isNoublionsPas
              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
              : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            {post.type}
          </span>
          <span className="text-muted-foreground">/</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
              {post.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
              {post.profiles?.username || 'Anonyme'}
            </span>
          </div>
          <span className="text-muted-foreground">/</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock size={12} />
            {relativeDate}
          </span>
        </div>

        <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">{post.title}</h3>
        {post.description && (
          <p className="text-muted-foreground text-sm mb-5 line-clamp-4 whitespace-pre-wrap leading-relaxed">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold bg-secondary text-foreground px-3 py-1.5 rounded-lg border border-border shadow-sm">
              <BookOpen size={14} className="text-primary" />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg border border-destructive/20 shadow-sm">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-5 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-secondary/50">
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
        <div className="flex items-center gap-4 pt-4 border-t border-border/50 mt-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all text-xs font-bold ${
              showComments ? 'text-primary bg-primary/10 ring-1 ring-primary/20' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
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
