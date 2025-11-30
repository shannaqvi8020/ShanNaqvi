# PromptVault

A prompt management tool for AI users to save, organize, and quickly copy their prompts.

## Overview

PromptVault is a Next.js 14 web application that helps users manage their AI prompts across different platforms like ChatGPT, Claude, and Midjourney. Users can organize prompts into folders, tag them for easy discovery, and use variable templates that get filled in when copying.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Project Structure

```
src/
├── app/
│   ├── auth/callback/     # Supabase auth callback
│   ├── login/             # Login page
│   ├── signup/            # Signup page with seed data creation
│   ├── page.tsx           # Main dashboard
│   ├── layout.tsx         # Root layout with Toaster
│   └── globals.css        # Global styles
├── components/
│   ├── Sidebar.tsx        # Left sidebar with folders/tags
│   ├── PromptList.tsx     # Middle section with prompt cards
│   ├── PromptEditor.tsx   # Right panel for editing prompts
│   └── VariableModal.tsx  # Modal for filling in {{variables}}
├── lib/supabase/
│   ├── client.ts          # Browser-side Supabase client
│   ├── server.ts          # Server-side Supabase client
│   └── middleware.ts      # Auth middleware for protected routes
├── types/
│   └── database.ts        # TypeScript types for database schema
└── middleware.ts          # Next.js middleware for auth
```

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key

## Database Schema

The app uses 4 main tables:
- **folders** - User-created folders for organizing prompts
- **prompts** - The actual prompts with title, content, platform, notes
- **tags** - User-created tags for categorization
- **prompt_tags** - Junction table for many-to-many relationship

See `supabase-schema.sql` for the complete schema with RLS policies.

## Key Features

1. **Authentication**: Email/password signup and login with protected routes
2. **Folder Organization**: Create, rename, and delete folders
3. **Tag System**: Add multiple tags to prompts, filter by tag
4. **Variable Templates**: Use `{{variable}}` syntax, prompts fill-in modal on copy
5. **Search**: Real-time search across prompt titles and content
6. **Sorting**: Sort by Recent, A-Z, or Most Used
7. **Usage Tracking**: Counts how many times each prompt is copied
8. **Seed Data**: New users get 3 sample folders and prompts

## Running Locally

1. Set up environment variables
2. Run the schema SQL in your Supabase project
3. Start with `npm run dev`

## Design

- Primary color: Purple (#7C3AED)
- Clean, minimal white/gray design
- Three-column responsive layout
- Smooth transitions and toast notifications
