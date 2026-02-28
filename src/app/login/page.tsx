'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/')
      }
    }
    void checkUser()
  }, [supabase, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      })
      if (error) setError(error.message)
      else {
        alert('Vérifiez vos emails pour confirmer votre inscription !')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setError(error.message)
      else {
        router.push('/')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 font-sans">
      <div className="w-full max-w-md p-10 bg-card rounded-3xl shadow-2xl border border-border-border animate-in fade-in zoom-in duration-500">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-primary tracking-tight">
          {isSignUp ? 'Créer un compte' : 'Bienvenue'}
        </h1>
        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase px-1">Nom d&apos;utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre pseudo"
                className="block w-full px-4 py-3 bg-background border border-border-border rounded-2xl text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase px-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="block w-full px-4 py-3 bg-background border border-border-border rounded-2xl text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase px-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full px-4 py-3 bg-background border border-border-border rounded-2xl text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
              required
            />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2 rounded-xl text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all active:scale-[0.98] shadow-primary/20"
          >
            {loading ? 'Chargement...' : isSignUp ? "S'inscrire" : 'Se connecter'}
          </button>
        </form>
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-semibold text-primary hover:text-blue-400 transition-colors"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  )
}
