import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // On utilise des valeurs fictives pour éviter de faire planter le build
  // si les variables d'environnement ne sont pas encore configurées dans Vercel.
  // Ces valeurs seront remplacées par les vraies au moment de l'exécution sur Vercel.
  return createBrowserClient(
    url || 'https://aioxyelmkmeklecdqziv.supabase.co',
    key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
  )
}
