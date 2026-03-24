export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  full_name?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  description?: string;
  type: 'revis-ions' | "n'oublions pas";
  subject?: string;
  due_date?: string;
  images: string[];
  profiles?: Profile;
  votes?: { value: number; user_id: string }[];
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
