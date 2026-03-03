'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User, LayoutDashboard, Settings } from 'lucide-react'

interface UserAuth {
  user_metadata?: {
    username?: string;
  };
  email?: string;
}

export default function Header({ user }: { user: UserAuth }) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 shadow-2xl shadow-primary/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
          <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
            <LayoutDashboard size={24} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tighter">Révis-<span className="text-primary">ion</span></h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3 p-1.5 pr-4 bg-background border border-border rounded-2xl shadow-inner group">
            <div className="bg-muted/10 p-2 rounded-xl border border-border/50 group-hover:bg-primary/10 transition-colors">
              <User size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Étudiant</span>
              <span className="text-sm font-bold text-foreground truncate max-w-[120px]">
                {user.user_metadata?.username || user.email?.split('@')[0] || 'Anonyme'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-border pl-6">
            <button
              onClick={() => {}}
              className="p-3 bg-muted/5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-2xl transition-all"
              title="Paramètres"
            >
              <Settings size={22} />
            </button>
            <button
              onClick={handleSignOut}
              className="p-3 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-2xl transition-all shadow-lg shadow-destructive/10"
              title="Déconnexion"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
