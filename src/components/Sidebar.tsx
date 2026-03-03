'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Users, Search, User } from 'lucide-react'

type Profile = {
  id: string
  username: string
  avatar_url: string
  online?: boolean
}

export default function Sidebar() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  const fetchProfilesRef = useRef<() => Promise<void>>(async () => {})

  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('username', { ascending: true })
    if (data) setProfiles(data)
  }, [supabase])

  useEffect(() => {
    fetchProfilesRef.current = fetchProfiles
  }, [fetchProfiles])

  useEffect(() => {
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
  }, [supabase, fetchProfiles])

  const filteredProfiles = profiles.filter(p =>
    p.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    const aOnline = onlineUsers.has(a.id)
    const bOnline = onlineUsers.has(b.id)
    if (aOnline && !bOnline) return -1
    if (!aOnline && bOnline) return 1
    return 0
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Users size={20} />
          </div>
          <h2 className="font-black text-lg text-foreground tracking-tight">Utilisateurs</h2>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{onlineUsers.size} en ligne</span>
        </div>
      </div>

      <div className="relative group mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ul className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {sortedProfiles.map((profile) => (
          <li key={profile.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted/5 transition-all group cursor-default">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-background border border-border rounded-2xl flex items-center justify-center text-primary group-hover:border-primary/30 transition-colors shadow-sm overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="group-hover:scale-110 transition-transform" />
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-card ${
                  onlineUsers.has(profile.id) ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-muted shadow-sm shadow-muted/50'
                }`}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-foreground truncate tracking-tight group-hover:text-primary transition-colors">
                {profile.username || 'Anonyme'}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {onlineUsers.has(profile.id) ? 'Connecté' : 'Hors-ligne'}
              </span>
            </div>
          </li>
        ))}
        {sortedProfiles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aucun résultat</p>
          </div>
        )}
      </ul>
    </div>
  )
}
