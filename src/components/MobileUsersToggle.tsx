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
        className="fixed bottom-6 left-6 w-14 h-14 bg-card border border-border text-primary rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
      >
        <Users size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-72 bg-card h-full p-4 relative animate-in slide-in-from-right border-l border-border shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted hover:text-foreground transition-colors hover:bg-muted/10 rounded-full"
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
