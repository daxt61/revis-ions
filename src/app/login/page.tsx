'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Lock, Mail, ArrowRight, Sparkles, Loader2, Info } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
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
      setEmail(savedUsername)
      setRememberMe(true)
    }
  }, [supabase, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Using technical email for username-based auth as per memory
    const technicalEmail = isSignUp
      ? `${username}@user.internal`
      : email.includes('@') ? email : `${email}@user.internal`

    if (rememberMe && !isSignUp) {
      localStorage.setItem('rememberedUsername', email)
    } else if (!rememberMe) {
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
        alert('Compte créé ! Vous pouvez maintenant vous connecter.')
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 font-sans text-foreground">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 backdrop-blur-md mb-4">
            <Sparkles size={18} className="text-primary" />
            <span className="text-xs font-black text-primary uppercase tracking-widest">Bienvenue sur le Hub</span>
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">
            {isSignUp ? 'Rejoindre' : 'Connexion'}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Le centre névralgique pour vos études et projets.
          </p>
        </div>

        <div className="card p-8 bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl space-y-8">
          <form onSubmit={(e) => { void handleAuth(e) }} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider ml-1">Nom d&apos;utilisateur</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-secondary/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/40 font-semibold"
                    placeholder="ex: Jules"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider ml-1">
                {isSignUp ? 'Email' : "Nom d'utilisateur ou Email"}
              </label>
              <div className="relative group">
                {isSignUp ? (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                ) : (
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                )}
                <input
                  type={isSignUp ? "email" : "text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-secondary/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/40 font-semibold"
                  placeholder={isSignUp ? "votre@email.com" : "votre nom d'utilisateur"}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider ml-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-secondary/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/40 font-semibold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center gap-2 ml-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-md bg-secondary border-border text-primary focus:ring-primary"
                />
                <label htmlFor="remember" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">Se souvenir de moi</label>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs font-bold bg-destructive/10 p-4 rounded-2xl border border-destructive/20 animate-in shake duration-300">
                <Info size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 text-sm font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 border border-primary/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isSignUp ? "Créer mon compte" : "Se connecter"}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-border/50 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? 'Vous avez déjà un compte ? Se connecter' : "Pas encore de compte ? Créer un profil"}
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
          Powered by Supabase & Next.js
        </p>
      </div>
    </div>
  )
}
