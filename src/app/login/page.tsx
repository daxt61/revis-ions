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
    const remembered = localStorage.getItem('rememberedUsername')
    if (remembered) {
      setUsername(remembered)
      setRememberMe(true)
    }

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

    const email = `${username}@user.internal`

    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username)
    } else {
      localStorage.removeItem('rememberedUsername')
    }

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
        setIsSignUp(false)
        setError("Compte créé ! Vous pouvez maintenant vous connecter.")
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

  const handleGuestLogin = async () => {
    setLoading(true)
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
      <div className="w-full max-w-md p-8 bg-card rounded-3xl shadow-xl border border-border">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">
          {isSignUp ? 'Créer un compte' : 'Se connecter'}
        </h1>
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Nom d&rsquo;utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="votre_pseudo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {!isSignUp && (
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                Se souvenir de moi
              </label>
            </div>
          )}

          {error && <p className="text-destructive text-sm bg-destructive/10 p-3 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
          >
            {loading ? 'Chargement...' : isSignUp ? "S'inscrire" : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all"
          >
            Continuer en tant qu&rsquo;invité
          </button>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
