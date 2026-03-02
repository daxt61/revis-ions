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
    <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm backdrop-blur-md bg-card/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary tracking-tight">Hub de Révision</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-background border border-border p-2 rounded-full">
              <UserIcon size={18} className="text-muted" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-foreground">
              {user.user_metadata?.username || user.email}
            </span>
          </div>

          <button
            onClick={() => { void handleSignOut() }}
            className="p-2 text-muted hover:text-red-500 transition-colors"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
