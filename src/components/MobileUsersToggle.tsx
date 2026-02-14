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
        className="fixed bottom-24 right-6 w-14 h-14 bg-card border border-border text-primary rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
      >
        <Users size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-72 bg-card h-full p-6 relative shadow-2xl border-l border-border animate-in slide-in-from-right duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
            >
              <X size={20} />
            </button>
            <div className="mt-10">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
