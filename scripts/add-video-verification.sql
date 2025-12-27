-- Add verification tracking to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_verified_by uuid;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS verification_notes text;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

-- Update RLS policy to only show verified videos or user's own videos
DROP POLICY IF EXISTS "Anyone can view videos" ON videos;

CREATE POLICY "Anyone can view verified videos or own videos"
ON videos FOR SELECT
USING (is_verified = TRUE OR auth.uid() = user_id);
