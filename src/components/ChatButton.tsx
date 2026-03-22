'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, X, Send, Loader2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export default function ChatButton({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      void fetchMessages()
      const channel = supabase
        .channel('chat_messages')
        .on('postgres_changes' as any, { event: 'INSERT', table: 'chat_messages' }, async (payload: any) => {
          // Fetch only the profile for the new message
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
  }, [isOpen, supabase])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, profiles(username)')
      .order('created_at', { ascending: true })
      .limit(50)
    if (data) setMessages(data)
  }

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
      {/* Floating Button - Positioned at bottom right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 border-4 border-background rounded-full animate-pulse"></span>
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 h-full sm:h-[600px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-3xl border border-border overflow-hidden transition-all animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-primary p-5 text-primary-foreground flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-black tracking-tight text-lg">Tchat Commun</h3>
                <p className="text-[10px] opacity-80 uppercase font-bold tracking-widest">En direct</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <span className="text-[10px] font-black text-muted-foreground mb-1.5 px-2 uppercase tracking-tighter">
                  {msg.profiles?.username || 'Anonyme'}
                </span>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                  msg.user_id === user.id
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-card border border-border text-foreground rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-4 bg-card border-t border-border flex gap-3">
            <input
              type="text"
              placeholder="Votre message..."
              className="flex-1 bg-muted border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary text-primary-foreground p-3 rounded-2xl hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-lg"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
