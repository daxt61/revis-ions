'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, UserPlus, Ghost } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername')
    if (savedUsername) {
      setUsername(savedUsername)
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

  const sanitizeUsername = (name: string) => {
    return name.trim().toLowerCase().replace(/\s+/g, '.')
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const isEmail = username.includes('@')
    const technicalEmail = isEmail ? username : `${sanitizeUsername(username)}@user.internal`

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
            username: isEmail ? username.split('@')[0] : username,
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-card/50 backdrop-blur-md rounded-2xl shadow-xl border border-border">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LogIn size={32} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center text-foreground">
          {isSignUp ? 'Créer un compte' : 'Bienvenue'}
        </h1>
        <p className="text-muted text-center mb-8 text-sm">
          {isSignUp ? 'Rejoignez la communauté du Hub' : 'Connectez-vous pour accéder à vos révisions'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5 ml-1">Nom d'utilisateur ou Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="votre_nom"
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5 ml-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground"
              required
            />
          </div>

          <div className="flex items-center justify-between ml-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background/50"
              />
              <span className="text-xs text-muted group-hover:text-foreground transition-colors">Se souvenir de moi</span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-500 text-xs text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus size={20} />
                S'inscrire
              </>
            ) : (
              <>
                <LogIn size={20} />
                Se connecter
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-foreground border border-border rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Ghost size={20} />
            Accès Invité
          </button>

          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="text-sm text-muted hover:text-primary transition-colors text-center mt-2"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  )
}
