'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Lock, UserPlus, LogIn, Ghost } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
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

    // Load remembered username
    const savedUsername = localStorage.getItem('rememberedUsername')
    if (savedUsername) {
      setUsername(savedUsername)
      setRememberMe(true)
    }
  }, [supabase, router])

  const sanitizeUsername = (name: string) => {
    return name.trim().toLowerCase().replace(/\s+/g, '.')
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const technicalEmail = `${sanitizeUsername(username)}@user.internal`

    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username)
    } else {
      localStorage.removeItem('rememberedUsername')
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: technicalEmail,
        password,
        options: {
          data: {
            username: username,
          },
        },
      })
      if (error) setError(error.message)
      else {
        // Since it's a technical email, it might be auto-confirmed in Supabase
        // or require confirmation. Assuming the username-only flow implies auto-confirm or no real email.
        router.push('/')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: technicalEmail,
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

  const handleGuestLogin = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInAnonymously()
    if (error) setError(error.message)
    else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 bg-card rounded-3xl shadow-2xl border border-border animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-2xl mb-4 border border-primary/20">
            <LogIn size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {isSignUp ? 'Créer un compte' : 'Bienvenue'}
          </h1>
          <p className="text-muted-foreground mt-2 text-center">
            {isSignUp
              ? "Rejoignez le Hub d'Entraide pour collaborer."
              : "Connectez-vous pour accéder à vos révisions."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">Nom d'utilisateur</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground transition-all"
                placeholder="Pseudo"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">Mot de passe</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between ml-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Se souvenir de moi</span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus size={18} />
                S'inscrire
              </>
            ) : (
              <>
                <LogIn size={18} />
                Se connecter
              </>
            )}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium tracking-wider">Ou continuer avec</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-border rounded-xl text-sm font-semibold text-foreground bg-secondary/50 hover:bg-secondary transition-all active:scale-[0.98]"
          >
            <Ghost size={18} />
            Accès Invité
          </button>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
