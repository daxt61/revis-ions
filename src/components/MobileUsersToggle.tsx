'use client'

import { useState } from 'react'
import { Users, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileUsersToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      {/* Floating Button - Positioned to the left */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-16 h-16 bg-card border border-border text-primary rounded-2xl shadow-2xl flex items-center justify-center z-40 hover:scale-110 active:scale-95 shadow-primary/5"
      >
        <Users size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-start">
          <div className="w-72 bg-card h-full p-6 relative animate-in slide-in-from-left shadow-2xl border-r border-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">Communauté</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted hover:text-foreground bg-background rounded-xl border border-border"
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
