'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Users } from 'lucide-react'

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
    // Wrap in setTimeout to avoid cascading renders lint error
    const timer = setTimeout(() => {
      void fetchProfiles()
    }, 0)

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
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await channel.track({ user_id: user.id })
          }
        }
      })

    return () => {
      clearTimeout(timer)
      void supabase.removeChannel(channel)
    }
  }, [supabase, fetchProfiles])

  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border p-5 sticky top-24 overflow-hidden">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <Users size={18} className="text-blue-500" />
        <h2 className="font-bold text-foreground">Utilisateurs</h2>
      </div>
      <ul className="space-y-4">
        {profiles.map((profile) => {
          const isOnline = onlineUsers.has(profile.id)
          return (
            <li key={profile.id} className="flex items-center gap-3 group cursor-default">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 font-bold text-sm border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                  {profile.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                    isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'
                  }`}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">
                  {profile.username || 'Anonyme'}
                </span>
                <span className="text-[10px] text-foreground/40 font-medium">
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </li>
          )
        })}
        {profiles.length === 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-foreground/40 italic">Aucun utilisateur</p>
          </div>
        )}
      </ul>
    </div>
  )
}
