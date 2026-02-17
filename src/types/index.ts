export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  updated_at?: string
}

export interface Post {
  id: string
  user_id: string
  title: string
  description: string | null
  type: 'revis-ions' | "n'oublions pas"
  subject: string | null
  due_date: string | null
  images: string[] | null
  created_at: string
  profiles?: Profile
  votes?: Vote[]
  comments?: { count: number }[]
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface Vote {
  id: string
  post_id: string
  user_id: string
  value: number
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}
