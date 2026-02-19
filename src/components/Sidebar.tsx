'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

type Profile = {
  id: string
  username: string
  avatar_url: string
  online?: boolean
}

export default function Sidebar() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const supabase = createClient()

  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
    if (data) setProfiles(data)
  }, [supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProfiles()

    // Realtime Presence
    const channel = supabase.channel('online-users')
    channel
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('presence' as any, { event: 'sync' }, () => {
        const state = channel.presenceState()
        const onlineIds = new Set<string>()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(state).forEach((presences: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          presences.forEach((p: any) => onlineIds.add(p.user_id))
        })
        setOnlineUsers(onlineIds)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('presence' as any, { event: 'join' }, () => {
        // console.log('join', key, newPresences)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('presence' as any, { event: 'leave' }, () => {
        // console.log('leave', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await channel.track({ user_id: user.id })
          }
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase, fetchProfiles])

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-6 sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Utilisateurs</h2>
        <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-full border border-border/30">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-foreground">{onlineUsers.size}</span>
        </div>
      </div>

      <ul className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center text-primary font-black text-sm border border-primary/20 transition-transform group-hover:scale-105 shadow-lg shadow-primary/5">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card shadow-sm ${
                  onlineUsers.has(profile.id) ? 'bg-green-500' : 'bg-red-500/50'
                }`}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-foreground/90 truncate group-hover:text-primary transition-colors italic">
                {profile.username || 'Anonyme'}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                {onlineUsers.has(profile.id) ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </li>
        ))}
        {profiles.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 italic">Aucun utilisateur</p>
          </div>
        )}
      </ul>
    </div>
  )
}
