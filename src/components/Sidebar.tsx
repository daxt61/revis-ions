'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Circle } from 'lucide-react'

type Profile = {
  id: string
  username: string
  avatar_url: string
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
    <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sticky top-20">
      <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
        <User size={18} className="text-blue-500" />
        <h2 className="font-bold text-foreground">Utilisateurs</h2>
      </div>
      <ul className="space-y-3">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 font-bold text-sm border border-blue-500/20">
                  {profile.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                    onlineUsers.has(profile.id) ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-foreground truncate group-hover:text-blue-400 transition-colors">
                {profile.username || 'Anonyme'}
              </span>
            </div>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              onlineUsers.has(profile.id) ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
            }`}>
              {onlineUsers.has(profile.id) ? 'En ligne' : 'Hors ligne'}
            </span>
          </li>
        ))}
        {profiles.length === 0 && (
          <div className="py-4 text-center">
             <p className="text-xs text-muted">Aucun utilisateur</p>
          </div>
        )}
      </ul>
    </div>
  )
}
