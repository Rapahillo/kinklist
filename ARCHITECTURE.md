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
- **URL-based access** — hash URLs must be bookmarkable and shareable (but require authentication)
- **Data isolation** — users only see lists they own or have been added to; authorization is enforced server-side on every request
- **Privacy by default** — PII (emails) is never exposed to unauthorized users; collaborators see nicknames, not emails

## Security Architecture

Given the extremely sensitive nature of the data (sexual fantasies, kinks, BDSM interests), security is a first-class concern. A data leak could cause serious personal, social, or professional harm.

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| Leaked hash URL exposes list | Authentication required for all list access; hash is an identifier, not an access token |
| Authenticated user accesses other users' lists | Server-side authorization on every data endpoint (owner/collaborator check) |
| PII leakage via API responses | Explicit field selection; emails visible only to list owners; collaborators see nicknames |
| Email bombing via magic link endpoint | Rate limiting: 3 per email/hour, 10 per IP/hour |
| Token brute-force | Cryptographically secure tokens (32+ bytes); rate limiting on verify endpoint |
| XSS / stored script injection | Input validation and sanitization; Content-Security-Policy header |
| IDOR (accessing items by guessing IDs) | All queries scoped to authorized lists; never trust client-provided IDs alone |
| Hash URL leakage via referer headers | Referrer-Policy: no-referrer on all responses |
| Session hijacking | HTTP-only, Secure, SameSite=Lax cookies; 3-day session TTL; token rotation on sensitive actions |
| Clickjacking | X-Frame-Options: DENY |

### Authorization Model

```
Unauthenticated → 401 redirect to login (with return URL)
Authenticated + Owner → full access (CRUD list, items, tags, collaborators)
Authenticated + Collaborator → read/write items and tags; view collaborator nicknames (not emails)
Authenticated + Neither → 403 Access Denied
```

### Data Privacy Rules

- **Emails** are PII — only visible to the list owner and the user themselves
- **Collaborator nicknames** are the display identity for non-owners
- **Item content** is never logged in audit trails (only action metadata)
- **API responses** use explicit field selection — never return full DB objects
- **createdByUserId** (FK) replaces createdByEmail to avoid PII in the items table

### Security Headers (all responses)

- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`
- `X-Frame-Options: DENY`

## Design Decisions

1. **No real-time sync for v1** — refresh-based updates; collaborators reload to see changes
2. **Tags are per-list** — each list maintains its own set of categories/tags
3. **Manual archive for completed todos** — completed items stay in the list until the user explicitly archives them; an archive section is available per list
4. **Authentication required for all access** — hash URLs require login + authorization; no anonymous access. This is a deliberate trade-off of convenience for privacy given the sensitive nature of the content
5. **Rate limiting on auth endpoints** — prevents email bombing and token brute-force attacks
6. **Audit logging** — security-relevant actions are logged for post-incident investigation; item content is never logged
