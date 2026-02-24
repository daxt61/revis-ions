'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
      if (data) setProfiles(data)
    }

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
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 shadow-xl shadow-black/20">
      <h2 className="font-bold mb-5 text-foreground flex items-center gap-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        Utilisateurs
      </h2>
      <ul className="space-y-4">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3 group cursor-default">
            <div className="relative">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-sm transition-transform group-hover:scale-105">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                  onlineUsers.has(profile.id) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                }`}
              />
            </div>
            <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
              {profile.username || 'Anonyme'}
            </span>
          </li>
        ))}
        {profiles.length === 0 && <p className="text-xs text-muted-foreground italic">Aucun utilisateur</p>}
      </ul>
    </div>
  )
}
