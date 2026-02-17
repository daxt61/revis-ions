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
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
             <span className="text-white font-black text-xl italic leading-none">H</span>
           </div>
           <h1 className="text-xl font-bold text-foreground tracking-tight hidden sm:block">Hub de Révision</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-2xl border border-border">
            <div className="bg-primary/20 p-1.5 rounded-full border border-primary/30">
              <UserIcon size={16} className="text-primary" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-foreground">
              {user.user_metadata?.username || user.email}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
