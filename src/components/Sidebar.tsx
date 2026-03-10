'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types/database'

export default function Sidebar() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const supabase = createClient()

  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('username', { ascending: true })
    if (data) setProfiles(data)
  }, [supabase])

  useEffect(() => {
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
  }, [supabase, fetchProfiles])

  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border p-4 sticky top-20">
      <h2 className="font-bold mb-4 text-foreground border-b border-border pb-2 flex items-center justify-between">
        Utilisateurs
        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">
          {profiles.length}
        </span>
      </h2>
      <ul className="space-y-3">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                  onlineUsers.has(profile.id) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-muted-foreground'
                }`}
              />
            </div>
            <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
              {profile.username || 'Anonyme'}
            </span>
          </li>
        ))}
        {profiles.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-2">Aucun utilisateur</p>}
      </ul>
    </div>
  )
}
