import { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  username: string
  avatar_url?: string
  full_name?: string
  updated_at?: string
  online?: boolean
}

export interface Post {
  id: string
  user_id: string
  created_at: string
  title: string
  description: string
  type: 'revis-ions' | "n'oublions pas"
  subject?: string
  due_date?: string
  images: string[]
  profiles?: Profile
  votes?: Vote[]
  comments?: { count: number }[]
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  created_at: string
  content: string
  profiles?: Profile
}

export interface Vote {
  id: string
  user_id: string
  post_id: string
  value: 1 | -1
}

export interface ChatMessage {
  id: string
  user_id: string
  created_at: string
  content: string
  profiles?: Profile
}
