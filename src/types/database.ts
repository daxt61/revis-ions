export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  full_name: string | null;
  updated_at: string | null;
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
  images: string[] | null;
  profiles?: Profile;
  votes?: Vote[];
  comments?: { count: number }[];
}

export interface Vote {
  id: string;
  user_id: string;
  post_id: string;
  value: 1 | -1;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  content: string;
  profiles?: Profile;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  created_at: string;
  content: string;
  profiles?: Profile;
}
