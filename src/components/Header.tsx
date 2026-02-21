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
    <header className="bg-card/80 border-b border-border sticky top-0 z-30 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary tracking-tight">Hub de Révision</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-2xl border border-border">
            <div className="bg-primary/20 p-1.5 rounded-full">
              <User size={16} className="text-primary" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-foreground">
              {user.user_metadata?.username || user.email?.split('@')[0]}
            </span>
          </div>

          <button
            onClick={() => void handleSignOut()}
            className="p-2 text-muted hover:text-red-500 transition-colors rounded-xl hover:bg-red-500/10"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
