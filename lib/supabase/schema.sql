-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL UNIQUE,
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
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved')),
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

-- Users policies
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

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
    FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admins can update all enquiries" ON enquiries
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admins can view all enquiry messages" ON enquiry_messages
    FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admins can insert enquiry messages" ON enquiry_messages
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));