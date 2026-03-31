'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function Header({ user }: { user: User }) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Utilisateur'

  return (
    <header className="bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
            <LayoutDashboard size={20} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Hub d'Entraide</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-2 border-r border-border h-8">
            <div className="bg-white/5 p-2 rounded-xl border border-border shadow-inner">
              <UserIcon size={18} className="text-muted" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-foreground">
              {username}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-95"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
