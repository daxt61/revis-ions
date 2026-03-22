'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Lock, Mail, UserPlus, LogIn, Ghost } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedUsername')
    if (remembered) {
      setUsername(remembered)
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
    // Trim, lowercase, and replace internal spaces with dots
    // This is the technical email format required by the project's memory.
    // Example: 'User Name' -> 'user.name'
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
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.')
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-3xl shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-primary tracking-tighter">
            HUB D&apos;ENTRAIDE
          </h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
            {isSignUp ? 'Créer un compte' : 'Espace Connexion'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Nom d&apos;utilisateur</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Se souvenir de moi</span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                {isSignUp ? "S'inscrire" : 'Se connecter'}
              </>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">OU</span></div>
        </div>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-3 px-4 border border-border rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-muted transition-colors"
        >
          <Ghost size={18} />
          Accès Invité (Anonyme)
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? 'Déjà un compte ?' : "Pas de compte ?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 font-bold text-primary hover:underline"
          >
            {isSignUp ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>
      </div>
    </div>
  )
}
