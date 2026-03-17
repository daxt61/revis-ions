export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface Vote {
  user_id: string;
  value: number;
}

export interface Post {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  type: 'revis-ions' | "n'oublions pas";
  subject: string | null;
  due_date: string | null;
  images: string[] | null;
  user_id: string;
  profiles: Profile | null;
  votes: Vote[];
  comments: { count: number }[];
}

export interface Comment {
  id: string;
  created_at: string;
  user_id: string;
  post_id: string;
  content: string;
  profiles: Profile | null;
}

export interface ChatMessage {
  id: string;
  created_at: string;
  user_id: string;
  content: string;
  profiles: Profile | null;
}
