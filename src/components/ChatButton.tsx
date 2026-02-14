'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, X, Send } from 'lucide-react'
import { ChatMessage, Profile } from '@/types'

export default function ChatButton({ user }: { user: { id: string } }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const profilesCache = useRef<Record<string, Profile>>({})
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, profiles(username)')
      .order('created_at', { ascending: true })
      .limit(50)
    if (data) setMessages(data as unknown as ChatMessage[])
  }, [supabase])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        fetchMessages()
      }, 0)

      const channel = supabase
        .channel('chat_messages')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('postgres_changes' as any, { event: 'INSERT', table: 'chat_messages' }, async (payload: { new: ChatMessage }) => {
          const userId = payload.new.user_id
          let profile = profilesCache.current[userId]

          if (!profile) {
            const { data } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .eq('id', userId)
              .single()
            if (data) {
              profile = data as Profile
              profilesCache.current[userId] = profile
            }
          }

          const newMessageWithProfile: ChatMessage = {
            ...payload.new,
            profiles: profile
          }
          setMessages((prev) => [...prev, newMessageWithProfile])
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isOpen, fetchMessages, supabase])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setLoading(true)

    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      content: newMessage,
    })

    if (!error) {
      setNewMessage('')
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 sm:right-auto sm:left-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:opacity-90 transition-all z-40 hover:scale-110 active:scale-95 shadow-primary/20"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:left-auto sm:w-96 h-full sm:h-[550px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-3xl border border-border overflow-hidden transition-all animate-in slide-in-from-bottom-10 sm:slide-in-from-right-10 duration-300">
          <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between shadow-lg shadow-primary/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-foreground/20 rounded-lg">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-bold">Tchat Commun</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/10 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <span className="text-[10px] text-muted-foreground mb-1 px-2 font-medium">
                  {msg.profiles?.username || 'Anonyme'}
                </span>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  msg.user_id === user.id
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted text-foreground rounded-tl-none border border-border/50'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-border bg-card flex gap-2 items-center">
            <input
              type="text"
              placeholder="Écrire un message..."
              className="flex-1 bg-muted/50 border border-border rounded-full px-5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary text-primary-foreground p-2.5 rounded-full hover:opacity-90 disabled:opacity-50 transition-all active:scale-90 shadow-lg shadow-primary/20 flex-shrink-0"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
