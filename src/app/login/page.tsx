'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, UserPlus, Sparkles, Loader2 } from 'lucide-react'

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-md p-8 bg-card rounded-3xl shadow-2xl border border-border relative z-10 transition-all hover:border-primary/50 group">
        <div className="flex flex-col items-center mb-8">
           <div className="bg-primary/10 p-4 rounded-2xl text-primary mb-4 border border-primary/20 shadow-xl shadow-primary/10">
            <Sparkles size={32} className="group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">
            Hub d'Entraide
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">
             {isSignUp ? 'Créez votre accès à la réussite' : 'Bienvenue dans la communauté'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nom d'utilisateur</label>
              <input
                type="text"
                placeholder="Ex: MajorDePromo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3 bg-secondary/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-secondary outline-none text-sm transition-all text-foreground"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-secondary/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-secondary outline-none text-sm transition-all text-foreground"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-secondary/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-secondary outline-none text-sm transition-all text-foreground"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-xs font-bold flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 font-black uppercase text-xs tracking-widest hover:bg-primary/80 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
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

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            {isSignUp ? 'Déjà un compte ? Connectez-vous' : 'Pas encore de compte ? Rejoignez-nous'}
          </button>
        </div>
      </div>

      <p className="mt-8 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
        &copy; {new Date().getFullYear()} Hub d'Entraide • Tous droits réservés
      </p>
    </div>
  )
}
