-- Add certificate verification fields to skills table
ALTER TABLE skills
ADD COLUMN IF NOT EXISTS certificate_url TEXT,
ADD COLUMN IF NOT EXISTS certificate_issuer TEXT,
ADD COLUMN IF NOT EXISTS certificate_id TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Update existing records to have verification_status based on is_verified
UPDATE skills
SET verification_status = CASE
  WHEN is_verified = true THEN 'verified'
  ELSE 'pending'
END
WHERE verification_status IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_skills_verification_status ON skills(verification_status);
