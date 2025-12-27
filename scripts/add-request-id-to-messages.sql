-- Add request_id column to messages table to link messages to skill requests
ALTER TABLE messages ADD COLUMN request_id uuid REFERENCES skill_requests(id) ON DELETE CASCADE;
