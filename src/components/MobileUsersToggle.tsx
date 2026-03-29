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
        className="fixed bottom-6 left-6 w-14 h-14 bg-gray-900 border border-white/10 text-blue-400 rounded-full shadow-lg flex items-center justify-center z-40 ring-4 ring-blue-500/10"
      >
        <Users size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-start">
          <div className="w-64 bg-gray-900 h-full p-4 relative animate-in slide-in-from-left duration-300 border-r border-white/10">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors"
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
