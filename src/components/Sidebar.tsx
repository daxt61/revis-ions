'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types'

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
    setTimeout(() => {
      fetchProfiles()
    }, 0)

    // Realtime for profile updates
    const profilesChannel = supabase
      .channel('public:profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, { event: '*', table: 'profiles' }, () => {
        fetchProfiles()
      })
      .subscribe()

    // Realtime Presence
    const channel = supabase.channel('online-users')
    channel
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('presence' as any, { event: 'sync' }, () => {
        const state = channel.presenceState()
        const onlineIds = new Set<string>()
        Object.values(state).forEach((presences: unknown) => {
          (presences as { user_id: string }[]).forEach((p) => onlineIds.add(p.user_id))
        })
        setOnlineUsers(onlineIds)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('presence' as any, { event: 'join' }, () => {
        // join logic
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('presence' as any, { event: 'leave' }, () => {
        // leave logic
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
      supabase.removeChannel(profilesChannel)
    }
  }, [supabase, fetchProfiles])

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-4 sticky top-20">
      <h2 className="font-semibold mb-4 text-foreground border-b border-border pb-2 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Utilisateurs
      </h2>
      <ul className="space-y-3">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs border border-primary/30">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                  onlineUsers.has(profile.id) ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
              {profile.username || 'Anonyme'}
            </span>
          </li>
        ))}
        {profiles.length === 0 && <p className="text-xs text-muted-foreground italic">Aucun utilisateur</p>}
      </ul>
    </div>
  )
}
