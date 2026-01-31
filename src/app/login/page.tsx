'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // On génère un email fictif basé sur le nom d'utilisateur
    const fakeEmail = `${username.trim().toLowerCase()}@dashboard.local`

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: fakeEmail,
        password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      })
      if (error) {
        if (error.message.includes('already registered')) {
          setError('Ce nom d\'utilisateur est déjà pris.')
        } else {
          setError(error.message)
        }
      } else {
        // Avec des emails fictifs, on peut souvent connecter l'utilisateur immédiatement
        // si la confirmation par email est désactivée dans Supabase.
        alert('Compte créé avec succès ! Connectez-vous maintenant.')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      })
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Nom d\'utilisateur ou mot de passe incorrect.')
        } else {
          setError(error.message)
        }
      } else {
        router.push('/')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
          {isSignUp ? 'Créer un compte' : 'Se connecter'}
        </h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: JeanDupont"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Chargement...' : isSignUp ? 'S\'inscrire' : 'Se connecter'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
          </button>
        </div>
      </div>
    </div>
  )
}
