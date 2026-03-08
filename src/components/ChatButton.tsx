'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, X, Send, Loader2 } from 'lucide-react'
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
      .select('*, profiles(username)')
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
            .select('username')
            .eq('id', payload.new.user_id)
            .single()

          const newMessageWithProfile = {
            ...payload.new,
            profiles: profile
          }
          setMessages((prev) => [...prev, newMessageWithProfile as any])
        })
        .subscribe()

      return () => {
        void supabase.removeChannel(channel)
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-all z-40 hover:scale-110 active:scale-95 shadow-primary/40"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 h-full sm:h-[550px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-3xl border border-border overflow-hidden transition-all animate-in slide-in-from-right-4">
          <div className="bg-primary p-5 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-sm">Tchat Commun</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 bg-background/30 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-black uppercase tracking-tighter text-muted mb-1.5 px-1 opacity-70">
                  {msg.profiles?.username || 'Anonyme'}
                </span>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.user_id === user.id
                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10 font-medium'
                    : 'bg-card border border-border text-foreground rounded-tl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
                <MessageSquare size={48} className="text-muted mb-4" />
                <p className="text-sm font-bold text-muted">Silence radio... Dites quelque chose !</p>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-border bg-card flex gap-3">
            <input
              type="text"
              placeholder="Écrire un message..."
              className="flex-1 bg-background border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted/50"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary text-white p-3 rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-90 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
