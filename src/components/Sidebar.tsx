'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Users as UsersIcon } from 'lucide-react'

type Profile = {
  id: string
  username: string
  avatar_url: string
}

export default function Sidebar() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const channelRef = useRef<any>(null)

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
    channelRef.current = channel

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
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current)
      }
    }
  }, [supabase, fetchProfiles])

  return (
    <div className="card p-6 bg-card border-border/50 shadow-xl backdrop-blur-sm sticky top-20">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className="bg-primary/10 p-2 rounded-xl text-primary border border-primary/20">
          <UsersIcon size={20} />
        </div>
        <h2 className="font-bold text-foreground text-lg">Membres</h2>
      </div>

      <ul className="space-y-4">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-10 h-10 bg-secondary border border-border/50 rounded-2xl flex items-center justify-center text-primary font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${
                  onlineUsers.has(profile.id) ? 'bg-green-500' : 'bg-destructive shadow-sm'
                }`}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground/90 truncate group-hover:text-primary transition-colors">
                {profile.username || 'Anonyme'}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {onlineUsers.has(profile.id) ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </li>
        ))}
        {profiles.length === 0 && (
          <div className="text-center py-6 bg-secondary/30 rounded-2xl border border-dashed border-border/50">
            <p className="text-xs text-muted-foreground">Aucun utilisateur</p>
          </div>
        )}
      </ul>
    </div>
  )
}
