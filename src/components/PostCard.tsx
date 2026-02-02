'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Calendar, BookOpen } from 'lucide-react'
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

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden flex ${isNoublionsPas ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-blue-500'}`}>
      {/* Vote Sidebar */}
      <div className="bg-gray-50 w-12 flex flex-col items-center py-2 gap-1 border-r">
        <button
          onClick={() => handleVote(1)}
          className={`p-1 rounded transition-colors ${userVote === 1 ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:bg-gray-200'}`}
        >
          <ArrowBigUp size={24} fill={userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-bold ${score > 0 ? 'text-orange-600' : score < 0 ? 'text-blue-600' : 'text-gray-700'}`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`p-1 rounded transition-colors ${userVote === -1 ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-200'}`}
        >
          <ArrowBigDown size={24} fill={userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
            isNoublionsPas ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {post.type}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            Posté par <span className="font-semibold text-gray-700">{post.profiles?.username || 'Anonyme'}</span>
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">{post.title}</h3>
        {post.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 whitespace-pre-wrap">{post.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          {post.subject && (
            <div className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
              <BookOpen size={14} />
              {post.subject}
            </div>
          )}
          {post.due_date && (
            <div className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-md font-medium">
              <Calendar size={14} />
              Échéance : {new Date(post.due_date).toLocaleDateString()}
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
                alt="image de la publication"
                className="w-full aspect-square object-cover rounded-lg border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-2 border-t mt-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
              showComments ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'
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
