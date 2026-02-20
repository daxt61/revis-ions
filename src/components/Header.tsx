'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User, LayoutDashboard } from 'lucide-react'
import { User as UserType } from '@supabase/supabase-js'

export default function Header({ user }: { user: UserType }) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-blue-500" size={24} />
          <h1 className="text-xl font-bold text-foreground tracking-tight">Hub</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border border-border">
            <User size={16} className="text-blue-400" />
            <span className="hidden sm:inline text-xs font-semibold text-foreground">
              {user.user_metadata?.username || user.email}
            </span>
          </div>

          <button
            onClick={() => void handleSignOut()}
            className="p-2 text-foreground/60 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
