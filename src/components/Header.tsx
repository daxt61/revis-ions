'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'
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
    <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-black text-primary tracking-tighter uppercase">
          Hub d&apos;Entraide
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-background/50 py-1.5 pl-1.5 pr-3 rounded-full border border-border">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <UserIcon size={16} className="text-primary" />
            </div>
            <span className="hidden sm:inline text-sm font-bold text-foreground">
              {user.user_metadata?.username || (user.is_anonymous ? 'Invité' : user.email?.split('@')[0])}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/10"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
