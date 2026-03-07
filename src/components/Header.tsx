'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Header({ user }: { user: SupabaseUser }) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Utilisateur'

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-black text-primary tracking-tighter uppercase italic">Dashboard</h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full border border-border">
            <div className="bg-primary/10 p-1 rounded-full">
              <User size={14} className="text-primary" />
            </div>
            <span className="hidden sm:inline text-xs font-bold text-foreground">
              {username}
            </span>
          </div>

          <button
            onClick={() => void handleSignOut()}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
