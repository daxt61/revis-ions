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
  const fetchMessagesRef = useRef<() => Promise<void>>(null)

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, profiles(username)')
      .order('created_at', { ascending: true })
      .limit(50)
    if (data) setMessages(data)
  }, [supabase])

  useEffect(() => {
    fetchMessagesRef.current = fetchMessages
  }, [fetchMessages])

  useEffect(() => {
    if (isOpen && fetchMessagesRef.current) {
      void fetchMessagesRef.current()

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
  }, [isOpen, supabase])

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
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all z-40 hover:scale-110 active:scale-95"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 h-full sm:h-[500px] bg-card shadow-2xl z-50 flex flex-col sm:rounded-2xl border border-border overflow-hidden transition-all animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4">
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} />
              <h3 className="font-bold">Tchat Commun</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-muted mb-1 px-1">
                  {msg.profiles?.username || 'Anonyme'}
                </span>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.user_id === user.id ? 'bg-primary text-white rounded-tr-none' : 'bg-card border border-border text-foreground rounded-tl-none shadow-sm'
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
              className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary text-white p-2.5 rounded-full hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
