'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User as UserIcon, Sparkles } from 'lucide-react'

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
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="bg-card rounded-3xl shadow-2xl shadow-black/30 border border-border p-6 sticky top-24 overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-primary/10 blur-[50px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>

      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border relative z-10">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <UserIcon size={20} />
        </div>
        <h2 className="font-black uppercase tracking-widest text-sm text-foreground">Utilisateurs</h2>
      </div>

      <ul className="space-y-4 relative z-10">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-4 group/item">
            <div className="relative">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary font-black text-sm border border-border group-hover/item:border-primary/50 transition-all">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card shadow-lg ${
                  onlineUsers.has(profile.id) ? 'bg-green-500 animate-pulse' : 'bg-muted/40'
                }`}
              />
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-black text-foreground group-hover/item:text-primary transition-colors truncate max-w-[140px]">
                {profile.username || 'Anonyme'}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                {onlineUsers.has(profile.id) ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </li>
        ))}
        {profiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2 opacity-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aucun utilisateur</p>
          </div>
        )}
      </ul>

      <div className="mt-10 p-4 bg-secondary/50 rounded-2xl border border-border relative z-10 overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Statistiques</span>
        </div>
        <p className="text-xs font-bold text-foreground">
          {onlineUsers.size} <span className="text-muted-foreground">actif(s) maintenant</span>
        </p>
      </div>
    </div>
  )
}
