'use client'

import { useState } from 'react'
import { Users, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileUsersToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      {/* Floating Button - Positioned Left-6 per memory */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-16 h-16 bg-card border border-border text-primary rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95 border-4"
      >
        <Users size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-start">
          <div className="w-72 bg-card h-full p-6 relative shadow-2xl border-r border-border animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground transition-colors bg-muted rounded-full"
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
