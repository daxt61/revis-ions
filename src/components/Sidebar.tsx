'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types/database'
import { Users, Circle } from 'lucide-react'

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
    <div className="bg-card rounded-2xl shadow-sm border border-border p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border">
        <Users className="text-primary" size={20} />
        <h2 className="font-black text-foreground tracking-tight">Utilisateurs</h2>
      </div>

      <ul className="space-y-4">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-sm border border-primary/20">
                  {profile.username?.charAt(0).toUpperCase() || '?'}
                </div>
                {onlineUsers.has(profile.id) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card bg-green-500 shadow-sm" />
                )}
              </div>
              <span className="text-sm font-bold text-foreground/90 truncate max-w-[120px]">
                {profile.username || 'Anonyme'}
              </span>
            </div>

            <Circle
              size={8}
              fill={onlineUsers.has(profile.id) ? 'currentColor' : 'none'}
              className={onlineUsers.has(profile.id) ? 'text-green-500' : 'text-muted/30'}
            />
          </li>
        ))}
        {profiles.length === 0 && (
          <div className="py-4 text-center">
             <p className="text-xs text-muted font-medium">Aucun utilisateur</p>
          </div>
        )}
      </ul>
    </div>
  )
}
