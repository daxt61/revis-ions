'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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

  const fetchProfilesRef = useRef(fetchProfiles)
  useEffect(() => {
    fetchProfilesRef.current = fetchProfiles
  }, [fetchProfiles])

  useEffect(() => {
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
            void channel.track({ user_id: user.id })
          }
        }
      })

    return () => {
      clearTimeout(timer)
      void supabase.removeChannel(channel)
    }
  }, [supabase, fetchProfiles])

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sticky top-20">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
        <h2 className="font-bold text-foreground uppercase text-xs tracking-widest">Utilisateurs</h2>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">
          {onlineUsers.size} EN LIGNE
        </span>
      </div>
      <ul className="space-y-3">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs border border-primary/20 transition-transform group-hover:scale-110">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                  onlineUsers.has(profile.id) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-gray-600'
                }`}
              />
            </div>
            <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {profile.username || 'Anonyme'}
            </span>
          </li>
        ))}
        {profiles.length === 0 && <p className="text-xs text-muted italic">Aucun utilisateur</p>}
      </ul>
    </div>
  )
}
