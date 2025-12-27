-- Create videos table for user-uploaded tutorial/educational videos
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(100),
  duration INTEGER, -- duration in seconds
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policies for videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Users can view all public videos
CREATE POLICY "Anyone can view videos" ON videos
  FOR SELECT USING (true);

-- Users can only create their own videos
CREATE POLICY "Users can create their own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own videos
CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own videos
CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
