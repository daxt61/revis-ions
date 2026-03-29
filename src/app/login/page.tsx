'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, LogIn, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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

    const technicalEmail = `${sanitizeUsername(username)}@user.internal`

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: technicalEmail,
        password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: technicalEmail,
        password,
      })
      if (error) {
        setError("Identifiants incorrects ou compte inexistant.")
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-6 selection:bg-blue-500/30">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 mb-2">
            <Sparkles className="text-blue-500" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Hub d'Entraide</h1>
          <p className="text-gray-500 font-medium">L'espace collaboratif pour vos révisions</p>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />

          <div className="mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {isSignUp ? <UserPlus size={20} className="text-blue-400" /> : <LogIn size={20} className="text-blue-400" />}
              {isSignUp ? 'Rejoindre la communauté' : 'Ravi de vous revoir'}
            </h2>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <CheckCircle2 className="text-green-500 shrink-0" size={20} />
              <p className="text-sm text-green-400 font-medium">Inscription réussie ! Vous pouvez maintenant vous connecter.</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 ml-1">Nom d'utilisateur</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-700 focus:border-blue-500/50 focus:ring-0 transition-all"
                  placeholder="votre_pseudo"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 ml-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-700 focus:border-blue-500/50 focus:ring-0 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${
                  rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-gray-950/50 border-white/10 group-hover:border-white/20'
                }`}>
                  {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <span className="text-sm text-gray-500 font-medium group-hover:text-gray-400 transition-colors">Se souvenir de moi</span>
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? "C'est parti !" : "Se connecter"}
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setSuccess(false)
              }}
              className="text-sm font-bold text-gray-500 hover:text-blue-400 transition-colors"
            >
              {isSignUp ? 'Déjà un membre ? Connexion' : "Pas encore inscrit ? Rejoindre le Hub"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 font-medium px-4 leading-relaxed">
          En vous connectant, vous acceptez de partager et d'aider la communauté dans le respect et la bienveillance.
        </p>
      </div>
    </div>
  )
}
