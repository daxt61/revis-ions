'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, X, Send, Ghost } from 'lucide-react'

export default function ChatButton({ user }: { user: any }) {
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
      .limit(100)
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
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-all z-40 hover:scale-110 active:scale-95 shadow-primary/30 group"
      >
        <MessageSquare size={28} className="group-hover:rotate-12 transition-transform duration-300" />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-28 sm:right-6 sm:w-[450px] h-full sm:h-[650px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-3xl border border-border overflow-hidden transition-all animate-in slide-in-from-bottom-10">
          <div className="bg-primary/95 backdrop-blur-sm p-5 text-primary-foreground flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">Tchat Commun</h3>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Temps Réel Actif</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-2xl transition-all hover:rotate-90">
              <X size={24} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground animate-in fade-in zoom-in duration-500">
                <Ghost size={48} className="opacity-20" />
                <p className="text-sm font-bold">Aucun message pour le moment</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col group ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[11px] font-bold mb-1.5 px-2 transition-colors ${msg.user_id === user.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {msg.profiles?.username || 'Anonyme'}
                  </span>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-transform group-hover:scale-[1.02] ${
                    msg.user_id === user.id
                      ? 'bg-primary text-primary-foreground rounded-tr-none shadow-primary/10'
                      : 'bg-card border border-border rounded-tl-none shadow-border/5'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={sendMessage} className="p-5 border-t border-border bg-card/80 backdrop-blur-sm flex gap-3">
            <input
              type="text"
              placeholder="Écrire un message..."
              className="flex-1 bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none shadow-inner"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary text-primary-foreground p-3 rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
            >
              <Send size={22} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
