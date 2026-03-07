export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  full_name: string | null;
  updated_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  description: string | null;
  type: 'revis-ions' | "n'oublions pas";
  subject: string | null;
  due_date: string | null;
  images: string[];
  profiles?: Profile;
  votes?: Vote[];
  comments?: { count: number }[];
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  content: string;
  profiles?: Profile;
}

export interface Vote {
  id: string;
  user_id: string;
  post_id: string;
  value: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  created_at: string;
  content: string;
  profiles?: Profile;
}
