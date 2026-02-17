'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types'
import { Users } from 'lucide-react'

export default function Sidebar() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
      if (data) setProfiles(data as Profile[])
    }

    void fetchProfiles()

    // Realtime Presence
    const channel = supabase.channel('online-users')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.on('presence' as any, { event: 'sync' }, () => {
        const state = channel.presenceState()
        const onlineIds = new Set<string>()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(state).forEach((presences: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="bg-card rounded-3xl shadow-lg border border-border p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <Users size={20} className="text-primary" />
        <h2 className="font-bold text-foreground">Utilisateurs</h2>
      </div>

      <ul className="space-y-4">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-sm border border-primary/20 transition-all group-hover:scale-105">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                  onlineUsers.has(profile.id) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                }`}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {profile.username || 'Anonyme'}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-medium">
                {onlineUsers.has(profile.id) ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </li>
        ))}
        {profiles.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center py-4">Aucun utilisateur</p>
        )}
      </ul>
    </div>
  )
}
