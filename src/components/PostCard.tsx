'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, ExternalLink, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import CommentSection from './CommentSection'

interface Post {
  id: string;
  type: string;
  created_at: string;
  title: string;
  description: string | null;
  subject: string | null;
  due_date: string | null;
  images: string[] | null;
  profiles: {
    username: string | null;
  } | null;
  votes: {
    user_id: string;
    value: number;
  }[] | null;
  comments: {
    count: number;
  }[];
}

interface UserAuth {
  id: string;
}

export default function PostCard({ post, currentUser, onUpdate }: { post: Post, currentUser: UserAuth, onUpdate: () => void }) {
  const [voting, setVoting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
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
    <>
      <div className={`bg-card rounded-3xl shadow-lg border border-border overflow-hidden flex transition-all hover:border-muted/30 ${isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-primary'}`}>
        {/* Vote Sidebar */}
        <div className="bg-background/50 w-14 flex flex-col items-center py-4 gap-2 border-r border-border/50">
          <button
            onClick={() => handleVote(1)}
            className={`p-1.5 rounded-xl transition-all ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:bg-muted/10'}`}
          >
            <ArrowBigUp size={28} fill={userVote === 1 ? 'currentColor' : 'none'} />
          </button>
          <span className={`text-sm font-black tracking-tight ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-primary' : 'text-foreground'}`}>
            {score}
          </span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1.5 rounded-xl transition-all ${userVote === -1 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted/10'}`}
          >
            <ArrowBigDown size={28} fill={userVote === -1 ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
              isNoublionsPas ? 'bg-orange-500/20 text-orange-400' : 'bg-primary/20 text-primary'
            }`}>
              {post.type}
            </span>
            <span className="text-xs text-muted-foreground/30">•</span>
            <span className="text-xs text-muted-foreground">
              Posté par <span className="font-bold text-foreground">{post.profiles?.username || 'Anonyme'}</span>
            </span>
            <span className="text-xs text-muted-foreground/30">•</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
            </span>
          </div>

          <h3 className="text-xl font-black text-foreground mb-2 leading-tight">{post.title}</h3>
          {post.description && (
            <p className="text-muted-foreground text-sm mb-5 line-clamp-4 whitespace-pre-wrap leading-relaxed">{post.description}</p>
          )}

          <div className="flex flex-wrap gap-3 mb-5">
            {post.subject && (
              <div className="flex items-center gap-2 text-xs bg-muted/10 text-muted-foreground px-3 py-1.5 rounded-xl border border-border/50 font-medium">
                <BookOpen size={14} />
                {post.subject}
              </div>
            )}
            {post.due_date && (
              <div className="flex items-center gap-2 text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-xl border border-destructive/20 font-bold">
                <Calendar size={14} />
                Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className={`grid gap-3 mb-5 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {post.images.map((img: string, i: number) => (
                <div key={i} className="group relative aspect-video overflow-hidden rounded-2xl border border-border shadow-sm">
                  <img
                    src={img}
                    alt="post"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                    onClick={() => setSelectedImage(img)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <ExternalLink size={24} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 pt-4 border-t border-border/50">
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold ${
                showComments ? 'text-primary bg-primary/10 ring-1 ring-primary/20' : 'text-muted-foreground hover:bg-muted/10'
              }`}
            >
              <MessageCircle size={18} />
              {post.comments[0]?.count || 0} Commentaires
            </button>
          </div>

          {showComments && (
            <div className="mt-6 pt-6 border-t border-border/30">
              <CommentSection post={post} currentUser={currentUser} />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-3 bg-card rounded-full text-foreground hover:scale-110 transition-transform shadow-xl border border-border"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
