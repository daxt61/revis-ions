'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen, User as UserIcon, ImageIcon } from 'lucide-react'
import CommentSection from './CommentSection'
import { Post } from '@/utils/types'
import { User } from '@supabase/supabase-js'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PostCard({ post, currentUser, onUpdate }: { post: Post, currentUser: User, onUpdate: () => void }) {
  const [voting, setVoting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const supabase = createClient()

  const userVote = post.votes?.find((v: any) => v.user_id === currentUser.id)?.value || 0
  const score = post.votes?.reduce((acc: number, v: any) => acc + (v.value as number), 0) || 0

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
    <div className={`group bg-gray-900/40 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden flex ${
      isNoublionsPas
        ? 'border-orange-500/30 hover:border-orange-500/50 shadow-lg shadow-orange-500/5'
        : 'border-blue-500/30 hover:border-blue-500/50 shadow-lg shadow-blue-500/5'
    }`}>
      {/* Vote Sidebar */}
      <div className="bg-gray-950/30 w-12 flex flex-col items-center py-4 gap-1 border-r border-white/5">
        <button
          onClick={() => handleVote(1)}
          className={`p-1 rounded-lg transition-all ${
            userVote === 1
              ? 'text-orange-400 bg-orange-400/10'
              : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
          }`}
        >
          <ArrowBigUp size={24} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-bold my-1 ${
          score > 0 ? 'text-orange-400' : score < 0 ? 'text-blue-400' : 'text-gray-400'
        }`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`p-1 rounded-lg transition-all ${
            userVote === -1
              ? 'text-blue-400 bg-blue-400/10'
              : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
          }`}
        >
          <ArrowBigDown size={24} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
            isNoublionsPas
              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {post.type}
          </span>
          <span className="text-gray-600">•</span>
          <div className="flex items-center gap-1.5 group/user">
            <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center border border-white/5">
              <UserIcon size={10} className="text-gray-400" />
            </div>
            <span className="text-xs font-semibold text-gray-300 group-hover/user:text-white transition-colors">
              {post.profiles?.username || 'Anonyme'}
            </span>
          </div>
          <span className="text-gray-600">•</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>

        {post.description && (
          <p className="text-gray-400 text-sm mb-5 line-clamp-3 whitespace-pre-wrap leading-relaxed">
            {post.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mb-5">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-xs bg-gray-800/50 text-blue-300 px-3 py-1.5 rounded-full border border-blue-500/10">
              <BookOpen size={14} className="text-blue-400" />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full border border-red-500/20 font-medium">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-3 mb-5 ${
            post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'
          }`}>
            {post.images.map((img: string, i: number) => (
              <div key={i} className="relative aspect-video sm:aspect-square group/img overflow-hidden rounded-xl border border-white/10">
                <img
                  src={img}
                  alt="post image"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110 cursor-pointer"
                  onClick={() => window.open(img, '_blank')}
                />
                <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-colors pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-semibold ${
              showComments
                ? 'text-blue-400 bg-blue-400/10 border border-blue-400/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
            }`}
          >
            <MessageCircle size={18} />
            {post.comments && post.comments[0] ? post.comments[0].count : 0} Commentaires
          </button>
        </div>

        {showComments && (
          <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
            <CommentSection post={post} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  )
}
