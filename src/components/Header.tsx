'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'
import { User } from '@/types/database'

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
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-black text-primary tracking-tighter italic">HUB</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-2xl border border-border">
            <div className="bg-primary/20 p-1.5 rounded-full">
              <UserIcon size={16} className="text-primary" />
            </div>
            <span className="hidden sm:inline text-sm font-bold text-foreground">
              {username}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
