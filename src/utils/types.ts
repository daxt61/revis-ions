export interface Profile {
  id: string
  username: string
  avatar_url?: string
  full_name?: string
  updated_at?: string
}

export interface Post {
  id: string
  user_id: string
  created_at: string
  title: string
  description?: string
  type: 'revis-ions' | "n'oublions pas"
  subject?: string
  due_date?: string
  images: string[]
  profiles?: {
    username: string
    avatar_url?: string
  }
  votes?: {
    value: number
    user_id: string
  }[]
  comments?: {
    count: number
  }[]
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  created_at: string
  content: string
  profiles?: {
    username: string
  }
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
  profiles?: {
    username: string
  }
}
