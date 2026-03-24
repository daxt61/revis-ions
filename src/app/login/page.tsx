'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Lock, Mail, UserPlus, LogIn, Ghost, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
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

    if (rememberMe && username) {
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

  const handleGuestLogin = async () => {
    setGuestLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInAnonymously()
    if (error) setError(error.message)
    else {
      router.push('/')
      router.refresh()
    }
    setGuestLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md p-8 bg-card rounded-3xl shadow-2xl border border-border relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-bold text-card-foreground">
            {isSignUp ? 'Créer un compte' : 'Bienvenue'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm text-center">
            {isSignUp ? 'Rejoignez la communauté de révision' : 'Connectez-vous pour accéder à votre dashboard'}
          </p>
        </div>

        <form onSubmit={(e) => void handleAuth(e)} className="space-y-5">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                Nom d'utilisateur
              </label>
              <input
                type="text"
                placeholder="Votre pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-card-foreground flex items-center gap-2">
              <Mail size={16} className="text-muted-foreground" />
              Email
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-card-foreground flex items-center gap-2">
              <Lock size={16} className="text-muted-foreground" />
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
              required
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-colors ${rememberMe ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                  {rememberMe && <div className="absolute inset-0 flex items-center justify-center text-white"><UserPlus size={12} /></div>}
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-card-foreground transition-colors">Se souvenir de moi</span>
            </label>
            {!isSignUp && (
              <button type="button" className="text-xs text-primary hover:underline">Mot de passe oublié ?</button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || guestLoading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : isSignUp ? "S'inscrire" : "Se connecter"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Ou continuer avec</span>
          </div>
        </div>

        <button
          onClick={() => void handleGuestLogin()}
          disabled={loading || guestLoading}
          className="w-full py-3 px-4 bg-muted border border-border text-card-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {guestLoading ? <Loader2 className="animate-spin" size={20} /> : <><Ghost size={20} className="text-primary" /> Mode Invité</>}
        </button>

        <div className="mt-8 text-center text-sm">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-muted-foreground hover:text-primary font-medium transition-colors"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? Créer un compte"}
          </button>
        </div>
      </div>
    </div>
  )
}
