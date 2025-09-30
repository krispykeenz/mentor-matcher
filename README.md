# MentorMatch SA

MentorMatch SA is a mobile-first mentorship platform for South African community-service health professionals. Built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui-inspired components, and Firebase services, it delivers swipe-style discovery, structured mentorship workflows, and POPIA-aligned privacy controls.

## Table of contents

- [Architecture](#architecture)
- [Features](#features)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Development workflow](#development-workflow)
- [Testing](#testing)
- [Seeding demo data](#seeding-demo-data)
- [Progressive Web App](#progressive-web-app)
- [Deployment](#deployment)
- [Switching to Supabase](#switching-to-supabase)
- [CI](#ci)
- [Firestore indexes & rules](#firestore-indexes--rules)
- [Troubleshooting](#troubleshooting)

## Architecture

- **Next.js 14 App Router** with React Server Components and TypeScript.
- **Firebase Auth** (passwordless, OAuth ready) and Firestore for data storage.
- **Firestore data model** covering users, public profiles, requests, matches, messages, reports, bookmarks, onboarding, and admin feature flags.
- **Modular repositories** in `lib/server/repositories` for data access. Matching scores use a pure `scoreCandidate` helper with unit tests.
- **Notifications** via Firebase Cloud Messaging (stub) and Resend email fallback.
- **Styling** via Tailwind CSS and shadcn/ui-style primitives.
- **Analytics** through PostHog (client opt-in), logging via `pino`.
- **PWA** shell with offline caching powered by Workbox.

High-level diagram:

```
[Next.js App Router]
  ├─ UI (Tailwind, shadcn/ui)
  ├─ Client providers (React Query, Auth, Analytics)
  ├─ API routes (/api/*) → Firestore via Firebase Admin SDK
  │    ├─ Repositories /lib/server
  │    └─ Notifications (FCM stub + Resend email)
  ├─ SWR + React Query for live data
  └─ Workbox service worker for offline shell
```

## Features

- Marketing landing page with legal pages and contact.
- Passwordless auth (magic link) and optional Google OAuth (toggle).
- Onboarding wizard enforcing required profile fields and consent.
- Swipe-style discovery experience with filters, bookmarks, and mentorship requests.
- Mentor inbox to accept/decline requests; automatic match creation and chat.
- Real-time style messaging UI with polling, read receipts stub, and attachment-ready API.
- Admin moderation dashboard to action reports and toggle feature flags.
- PWA install banner, offline shell for key pages, mobile-friendly gestures.
- Accessibility-first components (labels, focus states, semantic HTML).

## Getting started

```bash
npm install
npm run dev
```

The app starts on `http://localhost:3000`.

### Firebase setup

1. Create a Firebase project and enable **Authentication (Email link, Google)**, **Firestore**, **Storage**, and **Cloud Messaging**.
2. Create a web app and copy the client credentials into `.env.local` (see below).
3. Generate a service account key (JSON) for server-side admin access. Store the values in `.env.local`.
4. Configure Authentication templates for email link sign-in.
5. Enable Firestore in Native mode. Create the composite indexes listed below.
6. Upload placeholder icons to Storage if desired; default icons are bundled.

### Optional FCM setup

- Upload the generated `firebase-messaging-sw.js` to `public/` if using push messaging. The stub `sendPushNotification` logs events when credentials are not configured.

## Environment variables

Create `.env.local` from `.env.example`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=false
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
RESEND_API_KEY=
```

The Firebase private key must keep newline escapes (`\n`).

## Development workflow

- `npm run dev` – start Next.js with live reload.
- `npm run lint` – lint with ESLint + Next.js config.
- `npm run typecheck` – strict TypeScript checking.
- `npm run test` – Vitest unit/integration tests.
- `npm run e2e` – Playwright smoke tests (requires `npm run dev` in another terminal or `PLAYWRIGHT_BASE_URL`).
- `npm run seed` – seed demo data into the configured Firebase project (requires Admin credentials).

## Testing

- **Unit tests**: `tests/__tests__/matching.test.ts` covers matching weights.
- **Component tests**: Add more under `tests/` using React Testing Library.
- **Playwright**: `tests/e2e/smoke.spec.ts` verifies landing page rendering across desktop & mobile viewports.

## Seeding demo data

The seed script adds 30+ demo users across occupations, provinces, and languages.

```bash
FIREBASE_PROJECT_ID=... FIREBASE_CLIENT_EMAIL=... FIREBASE_PRIVATE_KEY="..." npm run seed
```

## Progressive Web App

- `manifest.webmanifest` and icons included in `/public`.
- Workbox-powered `public/sw.js` precaches the Next.js build output and caches documents, scripts, styles, and images via `StaleWhileRevalidate`.
- Next-PWA registers the service worker automatically in production builds (`npm run build`).

## Deployment

### Vercel + Firebase

1. Push the repository to GitHub and import into Vercel.
2. Set environment variables in Vercel (same as `.env.local`).
3. Add `FIREBASE_PRIVATE_KEY` with newline escapes, and `RESEND_API_KEY` if using email notifications.
4. Configure Firebase Hosting/Cloud Messaging as needed. Ensure the service account used by Vercel has Firestore + Auth admin roles.
5. Deploy – Vercel runs `npm install && npm run build`.

### Firebase configuration

- Firestore indexes (create via Firebase console or `firebase indexes`):
  - `profiles_public`: `discoverable` ASC, `province` ASC, `occupation` ASC
  - `profiles_public`: `discoverable` ASC, `languages` ARRAY
  - `requests`: `receiverUserId` ASC, `status` ASC
  - `matches`: `participants` ARRAY
- Storage rules example:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /user_uploads/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

- Firestore rules scaffold:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles_public/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    match /requests/{requestId} {
      allow create: if request.auth != null && request.resource.data.senderUserId == request.auth.uid;
      allow read: if request.auth != null && (request.resource.data.senderUserId == request.auth.uid || request.resource.data.receiverUserId == request.auth.uid);
      allow update: if request.auth != null && (resource.data.receiverUserId == request.auth.uid || resource.data.senderUserId == request.auth.uid);
    }
    match /matches/{matchId} {
      allow read, update: if request.auth != null && request.auth.uid in resource.data.participants;
    }
    match /matches/{matchId}/messages/{messageId} {
      allow read, create: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/matches/$(matchId)).data.participants;
    }
    match /reports/{reportId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && request.auth.token.role == 'admin';
    }
    match /admin/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

## Switching to Supabase

The repository pattern isolates Firestore access in `lib/server`. To use Supabase:

1. Replace Firebase admin calls with Supabase client queries in the repository files.
2. Update `lib/firebase/client.ts` with Supabase Auth helpers (or create `lib/supabase`).
3. Provide equivalent SQL schema (example):

```sql
create table profiles (
  id uuid primary key,
  full_name text,
  role text,
  occupation text,
  province text,
  city text,
  specialties text[],
  languages text[],
  bio_short text,
  discoverable boolean default true
);
create index on profiles (discoverable, province, occupation);
create table requests (
  id uuid primary key,
  sender_user_id uuid references profiles(id),
  receiver_user_id uuid references profiles(id),
  message text,
  goals text[],
  status text,
  created_at timestamptz default now()
);
create table matches (
  id uuid primary key,
  mentor_id uuid references profiles(id),
  mentee_id uuid references profiles(id),
  status text,
  started_at timestamptz default now()
);
create table messages (
  id uuid primary key,
  match_id uuid references matches(id),
  sender_id uuid references profiles(id),
  body text,
  type text,
  created_at timestamptz default now()
);
```

4. Configure Supabase Row-Level Security to mirror the Firestore rules.

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs linting, type checks, Vitest, and Playwright smoke tests on every push and PR.

## Firestore indexes & rules

See the **Deployment** section. The `lib/server/repositories` include comments for needed indexes.

## Troubleshooting

- **Firebase admin errors**: confirm `FIREBASE_PRIVATE_KEY` retains newline escapes and the service account has Firestore + Auth admin roles.
- **Magic link auth**: ensure the email link redirect URL matches `NEXT_PUBLIC_SITE_URL` or use the default site origin.
- **PWA testing**: run `npm run build && npm run start` to test service worker registration locally.
- **Playwright**: run `npx playwright install` once before executing `npm run e2e`.
