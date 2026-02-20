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
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform shadow-blue-900/40"
      >
        <Users size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-72 bg-card h-full p-6 relative border-l border-border animate-in slide-in-from-right duration-300 shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            <div className="mt-12 h-full overflow-y-auto pb-10 custom-scrollbar">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
