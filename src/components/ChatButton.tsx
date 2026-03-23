'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, X, Send } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export default function ChatButton({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
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

  useEffect(() => {
    if (isOpen) {
      void fetchMessages()
      const channel = supabase
        .channel('chat_messages')
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
      {/* Floating Button - Right side */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/80 transition-all z-40 hover:scale-110 active:scale-95"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 h-full sm:h-[500px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-2xl border border-border overflow-hidden transition-all animate-in slide-in-from-right-4">
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} />
              <h3 className="font-bold">Tchat Commun</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-muted mb-1 px-1">
                  {msg.profiles?.username || 'Anonyme'}
                </span>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.user_id === user.id ? 'bg-primary text-white rounded-tr-none' : 'bg-border/50 text-foreground border border-border rounded-tl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-border bg-card flex gap-2">
            <input
              type="text"
              placeholder="Écrire un message..."
              className="flex-1 bg-border/50 border border-border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary text-white p-2 rounded-full hover:bg-primary/80 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
