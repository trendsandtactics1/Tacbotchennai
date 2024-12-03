export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url?: string;
  youtube_url?: string;
  tags: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}
