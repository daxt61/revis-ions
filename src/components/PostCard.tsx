'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, ExternalLink } from 'lucide-react'
import CommentSection from './CommentSection'
import type { Post } from '@/types/database'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PostCard({ post, currentUser, onUpdate }: { post: Post, currentUser: SupabaseUser, onUpdate: () => void }) {
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
    <div className={`bg-card rounded-2xl shadow-sm border border-border overflow-hidden flex transition-all hover:border-primary/30 ${isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-blue-500'}`}>
      {/* Vote Sidebar */}
      <div className="bg-secondary/30 w-12 flex flex-col items-center py-4 gap-1 border-r border-border">
        <button
          onClick={() => void handleVote(1)}
          className={`p-1 rounded-lg transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
        >
          <ArrowBigUp size={24} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-black ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          {score}
        </span>
        <button
          onClick={() => void handleVote(-1)}
          className={`p-1 rounded-lg transition-all ${userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
        >
          <ArrowBigDown size={24} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
            isNoublionsPas ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            {post.type}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            • Par <span className="font-bold text-foreground">{post.profiles?.username || 'Anonyme'}</span>
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">• {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</span>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">{post.title}</h3>
        {post.description && (
          <p className="text-muted-foreground text-sm mb-5 line-clamp-4 whitespace-pre-wrap leading-relaxed">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold bg-secondary text-muted-foreground px-2.5 py-1 rounded-lg border border-border">
              <BookOpen size={12} />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold bg-destructive/10 text-destructive px-2.5 py-1 rounded-lg border border-destructive/20">
              <Calendar size={12} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-6 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {post.images.map((img: string, i: number) => (
              <div key={i} className="group relative aspect-video sm:aspect-square overflow-hidden rounded-xl border border-border shadow-sm">
                <img
                  src={img}
                  alt="post image"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button
                  onClick={() => window.open(img, '_blank')}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <ExternalLink size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold ${
              showComments ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <MessageCircle size={16} />
            {post.comments && post.comments[0]?.count || 0} Commentaires
          </button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-dashed border-border">
            <CommentSection post={post} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  )
}
