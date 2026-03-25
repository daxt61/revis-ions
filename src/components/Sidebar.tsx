'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type Profile } from '@/utils/types'

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
    void fetchProfiles()
  }, [fetchProfiles])

  useEffect(() => {
    // Realtime Presence
    const channel = supabase.channel('online-users')
    channel
      .on('presence' as any, { event: 'sync' }, () => {
        const state = channel.presenceState()
        const onlineIds = new Set<string>()
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => onlineIds.add(p.user_id as string))
        })
        setOnlineUsers(onlineIds)
      })
      .on('presence' as any, { event: 'join' }, () => {
        // console.log('join', key, newPresences)
      })
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
  }, [supabase])

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sticky top-20">
      <h2 className="font-semibold mb-4 text-foreground border-b border-border pb-2">Utilisateurs</h2>
      <ul className="space-y-3">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                  onlineUsers.has(profile.id) ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-foreground/80 truncate">
              {profile.username || 'Anonyme'}
            </span>
          </li>
        ))}
        {profiles.length === 0 && <p className="text-xs text-muted">Aucun utilisateur</p>}
      </ul>
    </div>
  )
}
