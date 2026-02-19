'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { type User as SupabaseUser } from '@supabase/supabase-js'

export default function Header({ user }: { user: SupabaseUser }) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
            H
          </div>
          <h1 className="text-xl font-black text-foreground tracking-tighter uppercase italic">Hub</h1>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-3 bg-secondary/50 px-3 py-1.5 rounded-2xl border border-border/50">
            <div className="bg-primary/20 p-1.5 rounded-xl">
              <User size={18} className="text-primary" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-foreground">
              {user.user_metadata?.username || user.email}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
            title="Déconnexion"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </header>
  )
}
