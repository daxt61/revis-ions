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
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-gray-950/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
          Hub d'Entraide
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group">
            <div className="bg-blue-500/10 p-2 rounded-full border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
              <UserIcon size={18} className="text-blue-400" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
              {user.user_metadata?.username || user.email}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
