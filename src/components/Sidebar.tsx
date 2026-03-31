'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Profile } from '@/utils/types'

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

    // Realtime Presence
    const channel = supabase.channel('online-users')
    channel
      .on('presence' as any, { event: 'sync' }, () => {
        const state = channel.presenceState()
        const onlineIds = new Set<string>()
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user_id) onlineIds.add(p.user_id as string)
          })
        })
        setOnlineUsers(onlineIds)
      })
      .on('presence' as any, { event: 'join' }, () => {
        // Presence logic for joins
      })
      .on('presence' as any, { event: 'leave' }, () => {
        // Presence logic for leaves
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
    <div className="bg-card/50 backdrop-blur-md rounded-2xl shadow-xl border border-border p-5 sticky top-24 transition-all duration-300">
      <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
        <h2 className="font-bold text-foreground tracking-tight">Utilisateurs</h2>
        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
          En ligne: {onlineUsers.size}
        </span>
      </div>

      <ul className="space-y-4">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card shadow-md transition-colors ${
                  onlineUsers.has(profile.id) ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {profile.username || 'Anonyme'}
              </span>
              <span className="text-[10px] text-muted font-medium uppercase tracking-tighter">
                {onlineUsers.has(profile.id) ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
          </li>
        ))}
        {profiles.length === 0 && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-border mb-2" />
            <p className="text-xs text-muted font-medium">Aucun utilisateur</p>
          </div>
        )}
      </ul>
    </div>
  )
}
