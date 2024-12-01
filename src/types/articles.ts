export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url?: string;
  video_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
} 