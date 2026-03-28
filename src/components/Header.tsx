'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'

export default function Header({ user }: { user: any }) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Utilisateur'

  return (
    <header className="bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <div className="w-6 h-6 border-2 border-white rounded-md flex items-center justify-center font-bold text-white text-xs">
              H
            </div>
          </div>
          <h1 className="text-xl font-black text-foreground tracking-tighter uppercase">
            Hub d'Entraide
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-secondary/50 px-3 py-1.5 rounded-full border border-border transition-all hover:bg-secondary">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
              <UserIcon size={18} />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-foreground">
              {username}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
