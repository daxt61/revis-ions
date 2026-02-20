'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, X, Send, Clock, Loader2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'

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
  }, [isOpen, fetchMessages, supabase])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = useCallback(async (e: React.FormEvent) => {
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
  }, [newMessage, user.id, supabase])

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-500 transition-all z-40 hover:scale-110 active:scale-95 shadow-blue-900/40"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:left-6 sm:w-96 h-full sm:h-[550px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-3xl border border-border overflow-hidden transition-all animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-blue-600 p-5 text-white flex items-center justify-between shadow-lg shadow-blue-900/20 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <MessageSquare size={20} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-black text-sm tracking-tight">Tchat Commun</h3>
                <span className="text-[10px] font-bold text-white/60">En direct</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-background/50 custom-scrollbar">
            {messages.map((msg) => {
              const isOwn = msg.user_id === user.id
              return (
                <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-1.5 animate-in fade-in slide-in-from-${isOwn ? 'right' : 'left'}-2 duration-300`}>
                  <div className={`flex items-center gap-2 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] font-bold text-foreground/30 capitalize">
                      {msg.profiles?.username || 'Anonyme'}
                    </span>
                    <Clock size={8} className="text-foreground/20" />
                  </div>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20'
                      : 'bg-card border border-border rounded-tl-none text-foreground/80'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              )
            })}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 gap-3">
                <MessageSquare size={48} />
                <p className="text-xs font-bold">Commencez la discussion</p>
              </div>
            )}
          </div>

          <form onSubmit={(e) => void sendMessage(e)} className="p-4 border-t border-border bg-card flex gap-2 items-center">
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="Écrire un message..."
                className="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/20 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-500 disabled:opacity-30 transition-all active:scale-90 shadow-lg shadow-blue-900/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
