'use client'

import { useState } from 'react'
import { Users, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileUsersToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      {/* Floating Button - Left side as per memory for balance with chat button on right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-16 h-16 bg-card border border-border text-primary rounded-full shadow-2xl shadow-black/40 flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
      >
        <Users size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex justify-end animate-in fade-in duration-300">
          <div className="w-80 bg-card h-full p-6 relative shadow-2xl border-l border-border animate-in slide-in-from-right duration-500 ease-out">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90"
            >
              <X size={24} />
            </button>
            <div className="mt-12 h-full overflow-y-auto pb-20">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
