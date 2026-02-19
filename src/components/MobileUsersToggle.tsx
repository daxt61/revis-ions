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
        className="fixed bottom-8 right-8 w-16 h-16 bg-card border border-border/50 text-primary rounded-3xl shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Users size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end transition-all">
          <div className="w-80 bg-card h-full p-6 shadow-2xl border-l border-border/50 relative animate-in slide-in-from-right duration-500">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 left-6 p-2 bg-secondary/50 text-muted-foreground hover:text-foreground rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
            <div className="mt-16">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
