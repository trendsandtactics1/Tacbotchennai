export interface Announcement {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  created_at: string;
  active: boolean;
}
