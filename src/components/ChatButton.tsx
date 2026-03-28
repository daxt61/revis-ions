'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, X, Send, Loader2, User as UserIcon, Sparkles } from 'lucide-react'

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
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:bg-primary/80 transition-all z-40 hover:scale-110 active:scale-95 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 -translate-x-full group-hover:translate-x-full duration-700"></div>
        <MessageSquare size={28} />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[400px] h-full sm:h-[600px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-3xl border border-border overflow-hidden transition-all animate-in slide-in-from-right-4">
          <div className="bg-primary/10 backdrop-blur-md p-4 sm:p-5 text-foreground flex items-center justify-between border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl text-primary">
                <Sparkles size={20} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-black uppercase tracking-tight text-sm">Tchat Commun</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">En direct</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-destructive/10 hover:text-destructive p-2 rounded-xl transition-colors text-muted-foreground active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-background/50 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {msg.profiles?.username || 'Anonyme'}
                  </span>
                  <div className="w-1 h-1 bg-border rounded-full"></div>
                  <span className="text-[9px] text-muted-foreground/50">
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`max-w-[85%] p-4 text-sm font-medium leading-relaxed transition-all hover:shadow-lg ${
                  msg.user_id === user.id
                    ? 'bg-primary text-white rounded-2xl rounded-tr-none shadow-xl shadow-primary/10'
                    : 'bg-secondary border border-border rounded-2xl rounded-tl-none shadow-sm text-foreground'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 gap-4 opacity-50">
                <MessageSquare size={48} className="text-muted-foreground" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Aucun message pour le moment</p>
                <p className="text-xs text-muted-foreground">Soyez le premier à lancer la conversation !</p>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-4 sm:p-5 border-t border-border bg-card flex gap-3">
            <input
              type="text"
              placeholder="Écrire un message..."
              className="flex-1 bg-secondary/50 border border-border/50 rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-secondary outline-none transition-all placeholder:text-muted-foreground/50"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary text-white p-3.5 rounded-2xl hover:bg-primary/80 disabled:opacity-50 transition-all shadow-xl shadow-primary/20 active:scale-90"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
