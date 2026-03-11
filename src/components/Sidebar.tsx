'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types/database'

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
      .on('presence' as any, { event: 'sync' }, () => {
        const state = channel.presenceState()
        const onlineIds = new Set<string>()
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => onlineIds.add(p.user_id))
        })
        setOnlineUsers(onlineIds)
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
  }, [supabase])

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-5 sticky top-20">
      <h2 className="font-bold mb-5 text-foreground border-b border-border pb-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Utilisateurs
      </h2>
      <ul className="space-y-4">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center text-primary font-bold text-sm shadow-inner group-hover:border-primary/50 transition-all">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                  onlineUsers.has(profile.id) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-muted/30'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground truncate max-w-[120px]">
                {profile.username || 'Anonyme'}
              </span>
              <span className="text-[10px] text-muted">
                {onlineUsers.has(profile.id) ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </li>
        ))}
        {profiles.length === 0 && <p className="text-xs text-muted italic">Aucun utilisateur</p>}
      </ul>
    </div>
  )
}
