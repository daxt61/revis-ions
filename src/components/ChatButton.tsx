'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, X, Send } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function ChatButton({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, profiles(username)')
      .order('created_at', { ascending: true })
      .limit(50)
    if (data) setMessages(data)
  }, [supabase])

  const fetchMessagesRef = useRef(fetchMessages)
  useEffect(() => {
    fetchMessagesRef.current = fetchMessages
  }, [fetchMessages])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        void fetchMessages()
      }, 0)

      const channel = supabase
        .channel('chat_messages')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('postgres_changes' as any, { event: 'INSERT', table: 'chat_messages' }, async (payload: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.user_id)
            .single()

          const newMessageWithProfile = {
            ...payload.new,
            profiles: profile
          }
          setMessages((prev) => [...prev, newMessageWithProfile])
        })
        .subscribe()

      return () => {
        clearTimeout(timer)
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
      {/* Floating Button - Positioned to the right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-all z-40 hover:scale-110 active:scale-95 shadow-primary/30"
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 h-full sm:h-[600px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-3xl border border-border overflow-hidden transition-all animate-in slide-in-from-bottom-4">
          <div className="bg-primary p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Tchat Commun</h3>
                <p className="text-[10px] opacity-80 font-bold uppercase">En direct</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-muted mb-1.5 px-1 font-bold">
                  {msg.profiles?.username || 'Anonyme'}
                </span>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.user_id === user.id
                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10'
                    : 'bg-card border border-border rounded-tl-none shadow-sm text-foreground'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => void sendMessage(e)} className="p-4 border-t border-border bg-card flex gap-3">
            <input
              type="text"
              placeholder="Écrire un message..."
              className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted/50 text-foreground"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
