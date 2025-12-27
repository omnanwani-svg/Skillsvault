# Database Schema

This document describes the complete database structure for SkillsVault.

## Tables

### profiles

User profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, references auth.users |
| email | text | User's email address |
| full_name | text | User's full name |
| bio | text | User biography |
| avatar_url | text | URL to user's avatar image |
| time_balance | numeric | Current time credits balance |
| total_earned | numeric | Total time credits earned |
| total_spent | numeric | Total time credits spent |
| is_admin | boolean | Admin flag |
| created_at | timestamp | Profile creation timestamp |
| updated_at | timestamp | Last update timestamp |

**RLS Policies:**
- Users can view their own profile
- Users can insert their own profile
- Users can update their own profile
- Users can delete their own profile

### skills

Skill listings offered by users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to profiles |
| title | text | Skill title |
| description | text | Detailed description |
| category | text | Skill category |
| hourly_rate | numeric | Time credits per hour (usually 1) |
| certification_level | text | Certification level |
| certificate_url | text | URL to certificate |
| certificate_issuer | text | Certificate issuing organization |
| certificate_id | text | Certificate ID number |
| certification_file_url | text | Uploaded certificate file URL |
| verification_status | text | auto_verified, pending_review, or pending |
| is_verified | boolean | Verification flag |
| demo_video_url | text | URL to demo video |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**RLS Policies:**
- Anyone can view verified skills
- Users can create their own skills
- Users can update their own skills
- Users can delete their own skills

### skill_requests

Requests for skill exchanges.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| skill_id | uuid | Foreign key to skills |
| requester_id | uuid | Foreign key to profiles (requester) |
| provider_id | uuid | Foreign key to profiles (provider) |
| hours_requested | numeric | Number of hours requested |
| status | text | pending, accepted, rejected, completed |
| notes | text | Additional notes from requester |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**RLS Policies:**
- Users can view their own requests (sent or received)
- Users can create requests
- Users can update their requests

### messages

Messages between users regarding skill requests.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| sender_id | uuid | Foreign key to profiles |
| recipient_id | uuid | Foreign key to profiles |
| request_id | uuid | Foreign key to skill_requests |
| content | text | Message content |
| read | boolean | Read status |
| created_at | timestamp | Creation timestamp |

**RLS Policies:**
- Users can view their own messages
- Users can send messages
- Users can update their received messages

### transactions

Records of completed skill exchanges.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| from_user_id | uuid | Foreign key to profiles (giver) |
| to_user_id | uuid | Foreign key to profiles (receiver) |
| request_id | uuid | Foreign key to skill_requests |
| hours_exchanged | numeric | Number of hours exchanged |
| transaction_type | text | Type of transaction |
| status | text | Transaction status |
| created_at | timestamp | Creation timestamp |

**RLS Policies:**
- Users can view their own transactions

### ratings

User ratings and reviews.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| rater_id | uuid | Foreign key to profiles (rater) |
| rated_user_id | uuid | Foreign key to profiles (rated) |
| transaction_id | uuid | Foreign key to transactions |
| rating | integer | Rating value (1-5) |
| review | text | Optional review text |
| created_at | timestamp | Creation timestamp |

**RLS Policies:**
- Anyone can view ratings
- Users can create ratings
- Users can update their own ratings
- Users can delete their own ratings

### videos

User-uploaded demonstration videos.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to profiles |
| title | varchar | Video title |
| description | text | Video description |
| video_url | text | URL to video file |
| thumbnail_url | text | URL to thumbnail image |
| category | varchar | Video category |
| duration | integer | Duration in seconds |
| views | integer | View count |
| is_verified | boolean | Verification status |
| is_verified_by | uuid | Foreign key to profiles (admin) |
| verified_at | timestamp | Verification timestamp |
| verification_notes | text | Admin verification notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**RLS Policies:**
- Anyone can view verified videos or own videos
- Users can create their own videos
- Users can update their own videos
- Users can delete their own videos

## Relationships

\`\`\`
profiles (1) ----< (many) skills
profiles (1) ----< (many) skill_requests (as requester)
profiles (1) ----< (many) skill_requests (as provider)
profiles (1) ----< (many) messages (as sender)
profiles (1) ----< (many) messages (as recipient)
profiles (1) ----< (many) transactions (as from_user)
profiles (1) ----< (many) transactions (as to_user)
profiles (1) ----< (many) ratings (as rater)
profiles (1) ----< (many) ratings (as rated_user)
profiles (1) ----< (many) videos

skills (1) ----< (many) skill_requests
skill_requests (1) ----< (many) messages
skill_requests (1) ---- (1) transactions
transactions (1) ----< (many) ratings
\`\`\`

## Indexes

Recommended indexes for performance:

\`\`\`sql
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_verification_status ON skills(verification_status);
CREATE INDEX idx_skill_requests_requester_id ON skill_requests(requester_id);
CREATE INDEX idx_skill_requests_provider_id ON skill_requests(provider_id);
CREATE INDEX idx_skill_requests_status ON skill_requests(status);
CREATE INDEX idx_messages_request_id ON messages(request_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_transactions_from_user_id ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user_id ON transactions(to_user_id);
CREATE INDEX idx_ratings_rated_user_id ON ratings(rated_user_id);
CREATE INDEX idx_videos_user_id ON videos(user_id);
\`\`\`

## Migration Scripts

The database schema is managed through migration scripts in the `/scripts` folder. Run them in order:

1. `001_create_tables.sql` - Initial table creation
2. `002_add_hours_to_skills.sql` - Add hourly_rate field
3. `003_add_provider_to_requests.sql` - Add provider_id to requests
4. `004_add_hours_requested.sql` - Add hours_requested field
5. `005_fix_profiles_rls.sql` - Fix RLS policies
6. `006_add_request_notes.sql` - Add notes field to requests
7. `007_add_certificate_fields.sql` - Add certificate verification fields
8. `008_add_admin_role.sql` - Add is_admin field to profiles
