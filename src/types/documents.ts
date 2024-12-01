export interface DocumentMetadata {
  source_url?: string;
  title?: string;
  author?: string;
  processed_at?: string;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

export interface Document {
  id: string;
  content: string;
  embedding?: number[];
  metadata: DocumentMetadata;
  created_at: string;
}

export interface DocumentSearchResult extends Document {
  similarity?: number;
} 