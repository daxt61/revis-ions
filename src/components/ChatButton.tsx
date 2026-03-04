'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, X, Send, User as UserIcon } from 'lucide-react'
import { type User } from '@supabase/supabase-js'

export default function ChatButton({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const channelRef = useRef<any>(null)

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

      channelRef.current = channel

      return () => {
        if (channelRef.current) {
          void supabase.removeChannel(channelRef.current)
        }
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-xl flex items-center justify-center hover:bg-primary/90 transition-all z-40 hover:scale-110 active:scale-95 border border-primary/20"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 h-full sm:h-[600px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-3xl border border-border/50 overflow-hidden transition-all animate-in slide-in-from-right-6 backdrop-blur-md">
          <div className="bg-primary/10 backdrop-blur-sm p-5 text-foreground flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Salon Commun</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">En direct</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-secondary p-2 rounded-xl transition-all text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-background/30 scroll-smooth">
            {messages.map((msg) => {
               const isMe = msg.user_id === user.id;
               return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                  <div className={`flex items-center gap-2 mb-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-[10px] font-bold text-primary border border-border/50">
                      {msg.profiles?.username?.charAt(0).toUpperCase() || <UserIcon size={10} />}
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {msg.profiles?.username || 'Anonyme'}
                    </span>
                  </div>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
                    isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border/50 rounded-tl-none text-foreground'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>

          <form onSubmit={sendMessage} className="p-5 border-t border-border/50 bg-card/80 backdrop-blur-md flex gap-3">
            <input
              type="text"
              placeholder="Message..."
              className="flex-1 bg-secondary border border-border/50 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary text-primary-foreground p-3.5 rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 border border-primary/20"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
