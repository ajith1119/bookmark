# Bookmark Manager

A simple bookmark app with Google login and real-time updates.

## What it does

- Sign in with Google
- Save bookmarks with title and URL
- Delete bookmarks
- Updates show up instantly in all tabs
- Your bookmarks are private

## Tech used

- Next.js 14
- Supabase
- Tailwind CSS
- Vercel

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add your Supabase keys to `frontend/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=#############
NEXT_PUBLIC_SUPABASE_ANON_KEY=##############
```

3. Enable Google OAuth in Supabase dashboard under Authentication > Providers

4. Run locally:
```bash
npm run dev
```

6. Deploy to Vercel and add the same environment variables
