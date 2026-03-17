'use client'

import { useState } from 'react'
import { Users, X, LayoutDashboard } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileUsersToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      {/* Positioned on the left as requested */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-card border border-border text-primary rounded-full shadow-lg flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95"
      >
        <Users size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-start">
          <div className="w-80 bg-card h-full border-r border-border p-6 relative animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
               <div className="flex items-center gap-2">
                 <LayoutDashboard className="text-primary" size={24} />
                 <span className="font-black text-xl tracking-tight">Hub</span>
               </div>
               <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-muted hover:bg-border/50 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
            </div>

            <Sidebar />
          </div>
        </div>
      )}
    </div>
  )
}
