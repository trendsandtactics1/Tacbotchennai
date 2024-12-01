export interface Announcement {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  active: boolean;
  created_at: string;
} 