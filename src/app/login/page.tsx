'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

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
    checkUser()
  }, [supabase, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Conversion du username en email technique pour Supabase Auth
    const technicalEmail = email.includes('@') ? email : `${email}@user.internal`

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: technicalEmail,
        password,
        options: {
          data: {
            username: username || email,
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
    const { error } = await supabase.auth.signInAnonymously()
    if (error) setError(error.message)
    else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 font-sans">
      <div className="w-full max-w-md p-8 bg-card rounded-3xl border border-border shadow-2xl shadow-black/50">
        <div className="flex justify-center mb-8">
          <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
            <h1 className="text-3xl font-black text-primary tracking-tighter">HUB</h1>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6 text-center text-foreground uppercase tracking-widest">
          {isSignUp ? 'Créer un compte' : 'Connexion'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase text-muted-foreground ml-1">Nom d&apos;utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-muted/50 border border-transparent rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground transition-all"
                placeholder="Ex: JeanDupont"
                required
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase text-muted-foreground ml-1">
              {isSignUp ? 'Email' : 'Nom d\'utilisateur ou Email'}
            </label>
            <input
              type={isSignUp ? "email" : "text"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-transparent rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground transition-all"
              placeholder={isSignUp ? "email@exemple.com" : "Votre identifiant"}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase text-muted-foreground ml-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-transparent rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Chargement...' : isSignUp ? "S'inscrire" : 'Entrer'}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-tighter">
              <span className="bg-card px-2 text-muted-foreground">Ou continuer avec</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            className="w-full py-3 px-4 bg-muted/50 text-foreground border border-border rounded-2xl font-bold hover:bg-muted transition-all flex items-center justify-center gap-2"
          >
            Accès Invité
          </button>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? 'DÉJÀ UN COMPTE ? SE CONNECTER' : "PAS DE COMPTE ? CRÉER UN COMPTE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
