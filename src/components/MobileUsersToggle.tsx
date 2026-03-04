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
        className="fixed bottom-6 left-6 w-14 h-14 bg-card border border-border text-primary rounded-2xl shadow-xl flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
      >
        <Users size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-[85%] max-w-sm bg-card h-full p-6 relative animate-in slide-in-from-right-4 border-l border-border/50 shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
            >
              <X size={24} />
            </button>
            <div className="mt-12 h-full overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
