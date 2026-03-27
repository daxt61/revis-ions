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

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary tracking-tight">Hub d'Entraide</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-secondary p-2 rounded-full">
              <User size={18} className="text-foreground" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-foreground">
              {user.user_metadata?.username || user.email}
            </span>
          </div>

          <button
            onClick={handleSignOut}
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
