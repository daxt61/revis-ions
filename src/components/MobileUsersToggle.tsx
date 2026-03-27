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
        className="fixed bottom-6 left-6 w-14 h-14 bg-card border border-border text-primary rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <Users size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-start">
          <div className="w-64 bg-card h-full p-4 relative animate-in slide-in-from-left">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 text-muted hover:text-foreground"
            >
              <X size={20} />
            </button>
            <div className="mt-8">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
