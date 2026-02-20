'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Mail, Lock, User, ArrowRight, Loader2, UserCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
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

    const remembered = localStorage.getItem('rememberedUsername')
    if (remembered) {
      setUsername(remembered)
      setRememberMe(true)
    }
  }, [supabase, router])

  const handleAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

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
  }, [email, password, username, isSignUp, rememberMe, router, supabase])

  const handleGuestLogin = async () => {
    setGuestLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      router.push('/')
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 selection:bg-blue-500/30">
      <div className="w-full max-w-md p-8 bg-card rounded-3xl shadow-2xl border border-border space-y-8">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/20">
            <LayoutDashboard className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Hub</h1>
          <p className="text-foreground/40 text-sm font-medium">
            {isSignUp ? 'Rejoignez la communauté' : 'Ravi de vous revoir'}
          </p>
        </div>

        <form onSubmit={(e) => void handleAuth(e)} className="space-y-5">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/50 ml-1">Nom d&apos;utilisateur</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="votre_nom"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground placeholder:text-foreground/10 outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/50 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground placeholder:text-foreground/10 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/50 ml-1">Mot de passe</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-foreground placeholder:text-foreground/10 outline-none"
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
                className="w-4 h-4 rounded border-border bg-background text-blue-600 focus:ring-blue-500/20"
              />
              <span className="text-xs font-bold text-foreground/40 group-hover:text-foreground/60 transition-colors">Se souvenir de moi</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-500 text-xs font-bold text-center">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || guestLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isSignUp ? "S'inscrire" : 'Se connecter'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {!isSignUp && (
              <button
                type="button"
                onClick={() => void handleGuestLogin()}
                disabled={loading || guestLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-background border border-border hover:bg-foreground/5 text-foreground rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {guestLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <UserCircle size={18} />
                    Continuer en tant qu&apos;invité
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        <div className="pt-4 text-center border-t border-border">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors"
          >
            {isSignUp ? 'Déjà un compte ? Connectez-vous' : "Pas de compte ? Créez-en un"}
          </button>
        </div>
      </div>
    </div>
  )
}
