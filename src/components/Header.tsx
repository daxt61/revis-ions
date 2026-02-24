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
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-primary tracking-tight">HUB</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-2xl border border-border">
            <div className="bg-primary/10 p-1.5 rounded-xl">
              <UserIcon size={16} className="text-primary" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-foreground">
              {user.user_metadata?.username || user.email}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-xl"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
