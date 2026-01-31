'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
      if (data) setProfiles(data)
    }

    fetchProfiles()

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
      .on('presence' as any, { event: 'join' }, ({ key, newPresences }: any) => {
        // console.log('join', key, newPresences)
      })
      .on('presence' as any, { event: 'leave' }, ({ key, leftPresences }: any) => {
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
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-20">
      <h2 className="font-semibold mb-4 text-gray-800 border-b pb-2">Utilisateurs</h2>
      <ul className="space-y-3">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  onlineUsers.has(profile.id) ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 truncate">
              {profile.username || 'Anonyme'}
            </span>
          </li>
        ))}
        {profiles.length === 0 && <p className="text-xs text-gray-500">Aucun utilisateur</p>}
      </ul>
    </div>
  )
}
