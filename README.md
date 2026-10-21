# Recruit Hub

Recruitment platform with a built-in help centre. Next.js 14 (App Router) + MongoDB (Mongoose), deployable on Vercel.

## Run locally
1. Install Node.js 20.6 or newer.
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in `MONGODB_URI` (MongoDB Atlas) and `JWT_SECRET` (long random text).
4. `npm run seed` (creates sample users, articles and a job; password for all: `Password123!`)
5. `npm run dev` and open http://localhost:3000

## Roles
- **Candidate**: search the help centre, browse and apply for jobs, track applications.
- **Recruiter**: everything above, post vacancies, move applicants through the pipeline, write help articles (saved as drafts).
- **Administrator**: publish, edit and delete any article. Create admins directly in the database; they cannot self-register.

## Deploy to Vercel
1. Push this folder to GitHub and import the repo in Vercel.
2. Add `MONGODB_URI` and `JWT_SECRET` under Project Settings > Environment Variables.
3. In Atlas > Network Access allow Vercel to connect (0.0.0.0/0 is the simple option for a student project).
4. Deploy.

## Structure
- `app/` pages and API routes (`app/api/...`)
- `models/` Mongoose schemas: User, Article, Job, Application
- `lib/` database connection, auth/role guard, categories, search
- `scripts/seed.cjs` sample data

## Not built yet (next steps)
CV file upload (Vercel Blob/Cloudinary), password reset by email, email notifications, AI matching, analytics dashboard, rate limiting.
