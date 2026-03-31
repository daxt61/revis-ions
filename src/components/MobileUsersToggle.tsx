'use client'

import { useState } from 'react'
import { Users, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileUsersToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-card/50 backdrop-blur-md border border-border text-primary rounded-2xl shadow-xl flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95"
      >
        <Users size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-start">
          <div className="w-80 bg-card h-full p-6 relative animate-in slide-in-from-left shadow-2xl border-r border-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-foreground">Utilisateurs</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted hover:bg-white/5 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
