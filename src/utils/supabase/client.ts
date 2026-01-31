import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // On utilise des valeurs par défaut si les variables sont manquantes (ex: pendant le build)
  const supabaseUrl = url || 'https://placeholder.supabase.co'
  const supabaseKey = key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

  return createBrowserClient(supabaseUrl, supabaseKey)
}
