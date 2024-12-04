export interface Announcement {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}
