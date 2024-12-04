-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat histories table
CREATE TABLE chat_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES chat_histories(id),
    content TEXT NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiries table
CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiry messages table
CREATE TABLE enquiry_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enquiry_id UUID REFERENCES enquiries(id),
    content TEXT NOT NULL,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiries table indexes
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_updated_at ON enquiries(updated_at);

-- Add trigger to update enquiries.updated_at
CREATE OR REPLACE FUNCTION update_enquiry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE enquiries 
    SET updated_at = NEW.created_at
    WHERE id = NEW.enquiry_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_enquiry_timestamp ON enquiry_messages;

-- Create new trigger
CREATE TRIGGER update_enquiry_timestamp
    AFTER INSERT OR UPDATE ON enquiry_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_enquiry_timestamp();

-- Enable real-time for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE enquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE enquiry_messages;

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiry_messages ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable public registration" ON users;
DROP POLICY IF EXISTS "Enable insert for registration" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Simple policies for chat widget functionality
CREATE POLICY "enable_public_insert" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "enable_select_for_users" ON users
    FOR SELECT USING (true);

CREATE POLICY "enable_update_for_users" ON users
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add default trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Chat histories policies
CREATE POLICY "Users can view own chats" ON chat_histories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" ON chat_histories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM chat_histories WHERE id = messages.chat_id
        )
    );

CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM chat_histories WHERE id = messages.chat_id
        )
    );

-- Enquiries policies
CREATE POLICY "Users can view own enquiries" ON enquiries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enquiries" ON enquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enquiry messages policies
CREATE POLICY "Users can view own enquiry messages" ON enquiry_messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM enquiries WHERE id = enquiry_messages.enquiry_id
        )
    );

CREATE POLICY "Users can insert own enquiry messages" ON enquiry_messages
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM enquiries WHERE id = enquiry_messages.enquiry_id
        )
    );

-- Admin policies (replace 'admin_role' with your actual admin role check)
CREATE POLICY "Admins can view all enquiries" ON enquiries
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can update all enquiries" ON enquiries
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can view all enquiry messages" ON enquiry_messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can insert enquiry messages" ON enquiry_messages
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Update the status check constraint
ALTER TABLE enquiries 
  DROP CONSTRAINT IF EXISTS enquiries_status_check,
  ADD CONSTRAINT enquiries_status_check 
    CHECK (status IN ('pending', 'resolved'));

-- Add an admin user (replace with your desired admin details)
INSERT INTO users (name, mobile, role) 
VALUES ('Admin User', '1234567890', 'admin');

-- Add index for foreign key
CREATE INDEX IF NOT EXISTS idx_enquiry_messages_enquiry_id 
    ON enquiry_messages(enquiry_id);

-- Drop and recreate announcements table
DROP TABLE IF EXISTS announcements CASCADE;

CREATE TABLE announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    link TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT announcements_status_check 
        CHECK (status IN ('draft', 'published', 'archived'))
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Admin policies for announcements
CREATE POLICY "Admins can manage announcements" ON announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;

-- Add trigger for updated_at
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for announcements
INSERT INTO storage.buckets (id, name, public) 
VALUES ('announcements', 'announcements', true);

-- First, drop existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes" ON storage.objects;

-- Policy for public read access
CREATE POLICY "Give public access to announcements" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'announcements'
    );

-- Policy for admin uploads
CREATE POLICY "Allow admin uploads" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'announcements'
        AND (
            SELECT role FROM auth.users 
            WHERE auth.users.id = auth.uid()
        ) = 'admin'
    );

-- Policy for admin updates
CREATE POLICY "Allow admin updates" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'announcements'
        AND (
            SELECT role FROM auth.users 
            WHERE auth.users.id = auth.uid()
        ) = 'admin'
    );

-- Policy for admin deletes
CREATE POLICY "Allow admin deletes" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'announcements'
        AND (
            SELECT role FROM auth.users 
            WHERE auth.users.id = auth.uid()
        ) = 'admin'
    );

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Disable RLS for storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Create storage bucket with public access
INSERT INTO storage.buckets (id, name, public) 
VALUES ('announcements', 'announcements', true)
ON CONFLICT (id) DO NOTHING;

-- Drop any existing policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to announcements" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes" ON storage.objects;

-- Create articles table
CREATE TABLE articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    youtube_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Admin policies for articles
CREATE POLICY "Admins can manage articles" ON articles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Public can view active articles
CREATE POLICY "Public can view active articles" ON articles
    FOR SELECT USING (active = true);

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE articles;

-- Create storage bucket for articles
INSERT INTO storage.buckets (id, name, public) 
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- First, enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Then create the documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536),  -- For OpenAI embeddings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can manage documents" ON public.documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create index for faster similarity searches
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Add trigger for updated_at
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE documents;