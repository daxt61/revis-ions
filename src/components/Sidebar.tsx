'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/utils/types'

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
            void channel.track({ user_id: user.id })
          }
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-4 sticky top-20 shadow-xl">
      <h2 className="font-bold mb-4 text-gray-100 border-b border-white/5 pb-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Utilisateurs
      </h2>
      <ul className="space-y-3">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3 group transition-all">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm group-hover:border-blue-500/40 transition-colors">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                  onlineUsers.has(profile.id) ? 'bg-green-500' : 'bg-gray-600'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">
              {profile.username || 'Anonyme'}
            </span>
          </li>
        ))}
        {profiles.length === 0 && <p className="text-xs text-gray-500 italic">Aucun utilisateur</p>}
      </ul>
    </div>
  )
}
