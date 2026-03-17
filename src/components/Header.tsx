'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export default function Header({ user }: { user: User }) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm backdrop-blur-md bg-card/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl">
            <LayoutDashboard size={22} className="text-primary" />
          </div>
          <h1 className="text-xl font-black text-foreground tracking-tight">
            Hub d&apos;Entraide
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-background border border-border rounded-2xl">
            <div className="bg-border p-1.5 rounded-full">
              <UserIcon size={16} className="text-muted" />
            </div>
            <span className="hidden sm:inline text-sm font-bold text-foreground/90">
              {user.user_metadata?.username || user.email?.split('@')[0]}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
