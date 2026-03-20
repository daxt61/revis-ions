'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Lock, Mail, UserPlus, LogIn, UserCircle } from 'lucide-react'

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
      if (error) {
        setError(translateError(error.message))
      } else {
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: technicalEmail,
        password,
      })
      if (error) {
        setError(translateError(error.message))
      } else {
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
      setError(translateError(error.message))
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  const translateError = (message: string) => {
    if (message.includes('Invalid login credentials')) return 'Identifiants invalides.'
    if (message.includes('User already registered')) return 'Cet utilisateur existe déjà.'
    if (message.includes('Password should be at least 6 characters')) return 'Le mot de passe doit faire au moins 6 caractères.'
    return message
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-foreground">
      <div className="w-full max-w-md p-8 bg-card rounded-3xl shadow-2xl border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <UserCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-center tracking-tight">
            {isSignUp ? 'Créer un compte' : 'Bienvenue'}
          </h1>
          <p className="text-muted text-sm mt-2 text-center">
            {isSignUp ? 'Rejoignez la communauté du Hub' : 'Connectez-vous pour accéder au Hub d\'Entraide'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Nom d&apos;utilisateur</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: jean.dupont"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
          </div>

          {!isSignUp && (
            <div className="flex items-center justify-between ml-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background text-blue-600 focus:ring-blue-500 focus:ring-offset-card"
                />
                <span className="text-sm text-muted group-hover:text-foreground transition-colors">Se souvenir de moi</span>
              </label>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            {loading ? 'Chargement...' : isSignUp ? (
              <><UserPlus size={18} /> S&apos;inscrire</>
            ) : (
              <><LogIn size={18} /> Se connecter</>
            )}
          </button>
        </form>

        {!isSignUp && (
          <div className="mt-4">
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-foreground bg-background border border-border hover:bg-border transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <UserCircle size={18} />
              Continuer en tant qu&apos;invité
            </button>
          </div>
        )}

        <div className="mt-8 text-center border-t border-border pt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? S\'inscrire'}
          </button>
        </div>
      </div>
    </div>
  )
}
