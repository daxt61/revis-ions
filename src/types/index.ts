export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: "revis-ions" | "n'oublions pas";
  subject?: string;
  due_date?: string;
  images?: string[];
  created_at: string;
  profiles?: Profile;
  votes?: Vote[];
  comments?: { count: number }[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export interface Vote {
  id: string;
  post_id: string;
  user_id: string;
  value: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}
