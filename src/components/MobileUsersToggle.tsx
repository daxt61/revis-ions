'use client'

import { useState } from 'react'
import { Users, X, PanelsTopLeft } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileUsersToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-16 h-16 bg-card border-2 border-primary/20 text-primary rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
      >
        <Users size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex justify-start animate-in fade-in duration-300">
          <div className="w-[85%] max-w-sm bg-card h-full p-6 relative shadow-2xl border-r border-border animate-in slide-in-from-left duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-primary">
                <PanelsTopLeft size={24} />
                <h2 className="text-xl font-black tracking-tighter">Communauté</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 bg-muted/10 rounded-2xl text-muted-foreground hover:text-primary transition-all hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mt-4">
              <Sidebar />
            </div>

            <div className="absolute bottom-10 left-6 right-6 p-6 bg-primary/10 rounded-3xl border border-primary/20">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm text-foreground/80 font-medium">Vous êtes visible par les autres membres.</p>
            </div>
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  )
}
