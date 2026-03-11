'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
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

    const savedUsername = localStorage.getItem('rememberedUsername')
    if (savedUsername) {
      setUsername(savedUsername)
      setRememberMe(true)
    }
  }, [supabase, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Convert username to a technical email
    const sanitizedUsername = username.trim().toLowerCase().replace(/\s+/g, '.')
    const technicalEmail = `${sanitizedUsername}@user.internal`

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
        alert('Compte créé avec succès ! Connectez-vous maintenant.')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: technicalEmail,
        password,
      })
      if (error) setError(error.message)
      else {
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username)
        } else {
          localStorage.removeItem('rememberedUsername')
        }
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
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl border shadow-xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary tracking-tight">
          {isSignUp ? 'Créer un compte' : 'Connexion'}
        </h1>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5 ml-1">Nom d&apos;utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="votre_pseudo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1.5 ml-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {!isSignUp && (
            <div className="flex items-center gap-2 ml-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="text-sm text-muted">Se souvenir de moi</label>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Chargement...' : isSignUp ? "S'inscrire" : 'Se connecter'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted">Ou</span>
          </div>
        </div>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-background border hover:bg-white/5 text-foreground rounded-xl font-medium transition-all active:scale-95"
        >
          Continuer en tant qu&apos;invité
        </button>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline font-medium"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  )
}
