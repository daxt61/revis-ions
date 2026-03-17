'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, X, Send, User as UserIcon } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { ChatMessage } from '@/types/database'

export default function ChatButton({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, profiles(id, username, avatar_url)')
      .order('created_at', { ascending: true })
      .limit(50)
    if (data) setMessages(data as any)
  }, [supabase])

  useEffect(() => {
    if (isOpen) {
      void fetchMessages()
      const channel = supabase
        .channel('chat_messages')
        .on('postgres_changes' as any, { event: 'INSERT', table: 'chat_messages' }, async (payload: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', payload.new.user_id)
            .single()

          const newMessageWithProfile: ChatMessage = {
            ...payload.new,
            profiles: profile
          }
          setMessages((prev) => [...prev, newMessageWithProfile])
        })
        .subscribe()

      return () => {
        void supabase.removeChannel(channel)
      }
    }
  }, [isOpen, supabase, fetchMessages])

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
      {/* Floating Button - Positioned on the right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-primary/90 transition-all z-40 hover:scale-110 active:scale-95"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 h-full sm:h-[550px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-3xl border border-border overflow-hidden transition-all animate-in slide-in-from-bottom-4">
          <div className="bg-primary p-4 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-black tracking-tight">Tchat Commun</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.map((msg) => {
              const isMine = msg.user_id === user.id
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMine && (
                    <div className="w-8 h-8 bg-border rounded-xl flex items-center justify-center shrink-0 mt-1">
                      <UserIcon size={14} className="text-muted" />
                    </div>
                  )}
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    {!isMine && (
                      <span className="text-[10px] font-bold text-muted mb-1 ml-1 uppercase tracking-wider">
                        {msg.profiles?.username || 'Anonyme'}
                      </span>
                    )}
                    <div className={`p-3 rounded-2xl text-sm font-medium shadow-sm ${
                      isMine
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-card border border-border text-foreground rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-border bg-card flex gap-2">
            <input
              type="text"
              placeholder="Écrire un message..."
              className="flex-1 bg-background border border-border rounded-2xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-foreground transition-all"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary text-white p-2.5 rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/10 active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
