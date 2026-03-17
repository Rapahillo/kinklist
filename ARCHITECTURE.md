# KinkList — Tech Stack & Architecture

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| **Framework** | Next.js (App Router) | Frontend + API routes in one project, TypeScript throughout |
| **Language** | TypeScript | Single language for frontend, backend, and DB queries |
| **Database** | PostgreSQL via Neon | Free tier (0.5 GB, 190 compute hours/mo). Local Postgres via Docker for dev |
| **ORM** | Prisma | Type-safe DB access, schema-first migrations |
| **Email** | Resend | Free tier (100 emails/day). Console/log transport for local dev |
| **Hosting** | Vercel | Free tier, zero-config Next.js deploys via git push |
| **Styling** | Tailwind CSS | Ships with Next.js, no additional config |

## Non-Functional Requirements

- **Simplicity** — the UX should feel effortless; minimal clicks to create and manage todos
- **Responsiveness** — works well on both desktop and mobile browsers
- **URL-based access** — hash URLs must be bookmarkable and shareable
- **Data isolation** — users only see lists they own or have been added to (via dashboard); hash URLs are the explicit sharing mechanism

## Design Decisions

1. **No real-time sync for v1** — refresh-based updates; collaborators reload to see changes
2. **Tags are per-list** — each list maintains its own set of categories/tags
3. **Manual archive for completed todos** — completed items stay in the list until the user explicitly archives them; an archive section is available per list
4. **Abuse prevention** — magic link auth mitigates email guessing; consider rate limiting on magic link requests in later iterations
