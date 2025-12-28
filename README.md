# SkillVault - Time-Based Skill Exchange Platform

A revolutionary peer-to-peer platform where users exchange skills using **time as currency** instead of money. Teach what you know, learn what you need - all without spending a dime.

![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Security](#security)
- [Deployment](#deployment)
- [Contributors](#contributors)
- [License](#license)
- [Support](#support)
- [Author & Ownership](#author--ownership)
- [Copyright & Intellectual Property](#copyright--intellectual-property)

## Overview

SkillVault democratizes learning by removing financial barriers. Users earn "time credits" by teaching their skills and spend those credits to learn from others. Everyone's time is valued equally, creating a fair and inclusive learning ecosystem.

### The Problem

- Traditional learning platforms require expensive subscriptions
- Professional courses are financially inaccessible to many
- Skill exchange happens informally without accountability
- No unified platform for time-based bartering

### The Solution

- **Time as Currency**: Earn credits by teaching, spend by learning
- **Skill Verification**: Automated and manual certificate verification
- **Trust System**: Rating and review mechanism
- **Admin Moderation**: Content verification for quality assurance
- **Global Access**: Learn from anyone, anywhere

## Key Features

### For Users

- **Authentication System**: Secure email/password signup and login
- **User Dashboard**: Track time balance, active skills, and statistics
- **Skill Marketplace**: Browse and search verified skills across categories
- **Offer Skills**: List your expertise with demo videos and certificates
- **Request System**: Send learning requests and negotiate terms
- **Messaging**: Direct communication between users
- **Video Tutorials**: Upload and share educational content
- **Rating & Reviews**: Build reputation through peer feedback
- **Transaction History**: Complete audit trail of all exchanges
- **Profile Management**: Customizable profiles with avatar uploads

### For Administrators

- **Admin Dashboard**: Platform statistics and analytics
- **Skills Verification**: Review and approve skill listings
- **Video Moderation**: Approve or reject tutorial videos
- **User Management**: Monitor user activity and time balances
- **Flagged Content**: Review and moderate reported content
- **Certificate Validation**: Manual verification override

### Automated Systems

- **Auto-Verification**: Trusted certificates (Coursera, Udemy, etc.) automatically verified
- **Time Credit Tracking**: Automatic balance updates on transactions
- **View Counting**: Track tutorial video engagement
- **Status Management**: Automated request workflow (pending → accepted → completed)

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.0 | React framework with SSR and App Router |
| React | 19.2.0 | UI component library |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 4.1.9 | Utility-first styling |
| Radix UI | Latest | Accessible component primitives |
| Shadcn/ui | Latest | Pre-built component library |
| Lucide React | Latest | Icon system |
| React Hook Form | Latest | Form management |
| Zod | 3.25.76 | Schema validation |

### Backend

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | RESTful API endpoints |
| Server Actions | Form mutations |
| Supabase | PostgreSQL database |
| Supabase Auth | JWT-based authentication |
| Vercel Blob | File and video storage |

### Development & Deployment

| Tool | Purpose |
|------|---------|
| Git | Version control |
| Vercel | Hosting and CI/CD |
| ESLint | Code quality |
| Turbopack | Fast bundler |

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd skillvault
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables** (see [Environment Setup](#environment-setup))

4. **Set up the database** (see [Database Setup](#database-setup))

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Local Development Redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Vercel Blob Storage (for file uploads)
BLOB_READ_WRITE_TOKEN=your_blob_token
```

### Getting Your Credentials

**Supabase:**
1. Go to [supabase.com](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings → API**
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

**Vercel Blob:**
1. Deploy to Vercel or create a project
2. Go to **Storage → Create Database → Blob**
3. Copy the `BLOB_READ_WRITE_TOKEN`

## Database Setup

### Database Schema

The application uses 7 main tables:

1. **profiles** - User accounts and time balances
2. **skills** - Skill offerings with verification
3. **videos** - Tutorial videos
4. **skill_requests** - Learning requests
5. **transactions** - Time credit transfers
6. **ratings** - User reviews
7. **messages** - User communication

### Setup Instructions

**Option 1: Automatic (Recommended)**

If your database is already set up from v0, you're ready to go.

**Option 2: Manual Setup**

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Run the migration scripts (located in `/scripts` folder if available)
4. Enable Row Level Security (RLS) on all tables
5. Configure authentication settings

### Row Level Security

Ensure RLS is enabled with these policies:
- Users can read their own data
- Users can update their own profiles
- Public read access for verified content
- Admin bypass for moderation

## Running Locally

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

The application will be available at:
- **Local**: http://localhost:3000
- **Network**: Your local IP address

## Project Structure

```
skillvault/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin panel
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # User dashboard
│   ├── marketplace/         # Skill listings
│   ├── messages/            # Messaging system
│   ├── my-videos/           # User videos
│   ├── offer-skill/         # Create skill
│   ├── profile/             # User profiles
│   ├── requests/            # Request management
│   ├── skills/              # Skill details
│   ├── history/             # Transaction history
│   ├── rate/                # Rating page
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   └── ui/                  # UI component library
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and configs
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Helper functions
├── scripts/                 # Database scripts
├── .env.local              # Environment variables
├── middleware.ts           # Auth middleware
├── next.config.mjs         # Next.js config
├── tailwind.config.ts      # Tailwind config
└── tsconfig.json           # TypeScript config
```

## API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Profiles
- `GET /api/profile/[userId]` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/[userId]/skills` - User skills
- `GET /api/profile/[userId]/ratings` - User ratings

### Skills
- `GET /api/skills` - List all skills
- `POST /api/skills` - Create skill
- `GET /api/skills/[id]` - Get skill details
- `PUT /api/skills/[id]` - Update skill
- `DELETE /api/skills/[id]` - Delete skill

### Videos
- `GET /api/videos` - List videos
- `POST /api/videos` - Upload video
- `GET /api/videos/[id]` - Get video details
- `PUT /api/videos/[id]` - Update video

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User management
- `PUT /api/admin/videos/[id]` - Verify video
- `PUT /api/admin/skills/[id]` - Verify skill

## Security

### Authentication & Authorization
- JWT-based authentication via Supabase Auth
- HTTP-only cookies for session storage
- Middleware route protection
- Row Level Security (RLS) on all tables

### Data Protection
- Server-side validation with Zod schemas
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)
- CSRF protection via Supabase SDK

### File Upload Security
- File type validation
- 50MB size limits
- Signed URLs for access
- Content-type verification

## Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Remove `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes

### Continuous Deployment

Every push to the `main` branch automatically deploys to production.

## Admin Access

To access the admin panel at `/admin`:

1. Create an account via signup
2. Go to Supabase Dashboard → Table Editor → profiles
3. Find your user and set `is_admin` to `true`
4. Refresh and navigate to `/admin`

## Contributors

This project was developed collaboratively by:

### Lead Developer & Project Owner
- **Om Nanwani**  
  Email: omnanwani777@gmail.com  
  Role: Project Lead, Full-Stack Developer, System Architect

### Development Team
- **Abhishek Jaiswal**  
  Email: vanshjaiswal7889@gmail.com  
  Role: Frontend Developer, UI/UX Implementation

- **Samrat Dixit**  
  Email: samratdixit05@gmail.com  
  Role: Backend Developer, Database Design

### Contributions

Each team member contributed significantly to the success of this project:
- **Om Nanwani**: Project conceptualization, system architecture, core feature development, deployment, and documentation
- **Abhishek Jaiswal**: Frontend components, user interface design, responsive layouts, and user experience optimization
- **Samrat Dixit**: API development, database schema design, authentication system, and backend logic

## License

**Proprietary License with Academic Use Allowance**

This project is the intellectual property of **Om Nanwani** and is protected under copyright law. 

**You MAY:**
- Use this code for learning and educational purposes
- Reference this project in academic work with proper citation
- Fork for personal experimentation (non-commercial)

**You MAY NOT:**
- Use this code for commercial purposes without permission
- Claim this work as your own
- Remove copyright notices or author attribution
- Distribute modified versions commercially

For commercial licensing inquiries, contact: omnanwani777@gmail.com

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: omnanwani777@gmail.com

## Author & Ownership

**Project Owner:** Om Nanwani  
**Email:** omnanwani777@gmail.com  
**Institution:** Shri Ramswaroop Memorial University  
**Department:** Computer Science Engineering  
**Academic Year:** 2024-2025  
**Project Type:** Final Year Project  

### Project Details
- **Development Period:** September 2024 - December 2024
- **Technology Focus:** Full-Stack Web Development
- **Specialization:** Cloud-Native Applications

## Copyright & Intellectual Property

### Copyright Notice

```
Copyright © 2025-2025 Om Nanwani. All Rights Reserved.
```

**This project and its original concept are protected under intellectual property laws.**

### Concept & Innovation

**Original Concept:** Time-Based Skill Exchange Platform (SkillVault)

The core innovation of using **time as currency** for peer-to-peer skill exchange, combined with:
- Automated certificate verification system
- Time credit transaction mechanism
- Dual-mode content moderation (auto + manual)
- Video-based skill demonstration with verification

This concept, architecture, and implementation are the **original intellectual property** of **Om Nanwani**.

### Patent & Intellectual Property Rights

**Status:** Proprietary Concept - Original Work of Om Nanwani

**Unique Innovations:**
1. **Time-Based Credit System**: Novel algorithm for time-as-currency exchange
2. **Auto-Verification Technology**: Automated certification validation with trusted issuer recognition
3. **Dual-Mode Moderation**: Hybrid AI-assisted and manual content verification
4. **Skill-Video Coupling**: Mandatory demo video requirement for trust building

**Commercial Use:** Requires explicit written permission from the author.

**Academic Use:** Permitted with proper citation and attribution.

### Citation

If you use this project for academic or research purposes, please cite as:

```
Om Nanwani. (2024). SkillVault: A Time-Based Skill Exchange Platform. 
Shri Ramswaroop Memorial University, Department of Computer Science Engineering.
Contact: omnanwani777@gmail.com
```

### Rights & Permissions

- **Personal Use**: Allowed with attribution
- **Educational Use**: Allowed with proper citation
- **Commercial Use**: Requires written permission from Om Nanwani
- **Modification**: Allowed for personal learning; commercial modifications prohibited
- **Distribution**: Source code distribution must retain this copyright notice

### Technology Attribution

While the **concept and implementation are original**, this project uses open-source technologies:
- Next.js, React, TypeScript (MIT License)
- Supabase (Apache 2.0 License)
- Tailwind CSS, Radix UI, Shadcn/ui (MIT License)

### Disclaimer

This software is provided "as is", without warranty of any kind. The author is not liable for any damages arising from the use of this software.

## Acknowledgments

- Built with [v0.dev](https://v0.dev) by Vercel
- UI components from [Shadcn/ui](https://ui.shadcn.com)
- Database powered by [Supabase](https://supabase.com)
- Hosted on [Vercel](https://vercel.com)

**Special Thanks:**
- Shri Ramswaroop Memorial University - Department of Computer Science Engineering
- Project mentors and guides who provided valuable feedback
- Fellow students who participated in testing and feedback

---

**Made with ❤️ by Om Nanwani for democratizing education through time-based skill exchange**

**© 2025-2025 Om Nanwani - All Rights Reserved**
