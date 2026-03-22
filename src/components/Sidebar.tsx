'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Users, Ghost, Circle } from 'lucide-react'

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
    <div className="bg-card rounded-3xl shadow-xl border border-border p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 mb-8 border-b border-border pb-4 text-primary">
        <Users size={24} />
        <h2 className="font-black text-xl tracking-tighter uppercase">Membres</h2>
      </div>

      <ul className="space-y-4">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-4 group hover:translate-x-1 transition-transform cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center text-primary font-black text-sm border border-border shadow-sm group-hover:bg-primary/10 transition-colors">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-card transition-all ${
                  onlineUsers.has(profile.id) ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-muted-foreground/30'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground truncate max-w-[120px] group-hover:text-primary transition-colors">
                {profile.username || 'Anonyme'}
              </span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {onlineUsers.has(profile.id) ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </li>
        ))}
        {profiles.length === 0 && (
          <div className="py-10 text-center space-y-3 opacity-30">
            <Ghost className="mx-auto" size={40} />
            <p className="text-xs font-black uppercase tracking-widest">Aucun membre</p>
          </div>
        )}
      </ul>
    </div>
  )
}
