'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export default function Header({ user }: { user: any }) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600 tracking-tight">Tableau de bord</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gray-200 p-2 rounded-full">
              <User size={18} className="text-gray-600" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-700">
              {user.user_metadata?.username || user.email}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
