'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Profile } from '@/types/database'
import { ShieldCheck, User } from 'lucide-react'

export default function Sidebar() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
      if (data) setProfiles(data as Profile[])
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
      .on('presence' as any, { event: 'join' }, ({ key, newPresences }: any) => {
        void key
        void newPresences
      })
      .on('presence' as any, { event: 'leave' }, ({ key, leftPresences }: any) => {
        void key
        void leftPresences
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
    <div className="bg-card rounded-2xl shadow-sm border border-border p-5 sticky top-24 overflow-hidden">
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border">
        <ShieldCheck className="text-primary" size={18} />
        <h2 className="font-black uppercase tracking-tighter text-sm">Communauté</h2>
      </div>

      <ul className="space-y-4">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center text-primary border border-border group-hover:border-primary/50 transition-all overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username || ''} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-muted-foreground" />
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card shadow-sm ${
                  onlineUsers.has(profile.id) ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors leading-none mb-1">
                {profile.username || 'Anonyme'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {onlineUsers.has(profile.id) ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </li>
        ))}
        {profiles.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-muted-foreground font-medium italic">Aucun utilisateur</p>
          </div>
        )}
      </ul>
    </div>
  )
}
