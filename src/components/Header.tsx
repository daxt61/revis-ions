'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'
import { type User } from '@supabase/supabase-js'

export default function Header({ user }: { user: User }) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black text-xl">
            H
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight hidden sm:block">Hub</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-secondary/50 px-3 py-1.5 rounded-2xl border border-border/50">
            <div className="bg-primary/20 p-1.5 rounded-full border border-primary/20">
              <UserIcon size={16} className="text-primary" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-foreground/90">
              {user.user_metadata?.username || user.email}
            </span>
          </div>

          <button
            onClick={() => { void handleSignOut() }}
            className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
