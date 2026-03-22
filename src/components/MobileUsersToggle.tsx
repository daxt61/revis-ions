'use client'

import { useState } from 'react'
import { Users, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileUsersToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      {/* Positioned at bottom left to avoid overlap with ChatButton on right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-16 h-16 bg-card border border-border text-primary rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
      >
        <Users size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex justify-start animate-in fade-in duration-300">
          <div className="w-80 bg-card h-full p-6 relative border-r border-border shadow-2xl animate-in slide-in-from-left duration-500">
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <div className="flex items-center gap-3 text-primary">
                <Users size={24} />
                <h3 className="font-black text-xl tracking-tighter uppercase">Membres</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-100px)] pr-2 custom-scrollbar">
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
