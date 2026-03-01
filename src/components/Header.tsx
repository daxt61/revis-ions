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
    <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-500 tracking-tight">Dashboard</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gray-800 p-2 rounded-full border border-border">
              <UserIcon size={18} className="text-gray-400" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-300">
              {user.user_metadata?.username || user.email?.split('@')[0]}
            </span>
          </div>

          <button
            onClick={() => void handleSignOut()}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
