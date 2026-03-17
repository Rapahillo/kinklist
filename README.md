# KinkList

A shared todo list app for people with sexual fantasies, BDSM interests, and kinks. Create lists, share them with partners, and track desires you want to explore together.

## Tech Stack

- **Next.js** (App Router) — frontend + API
- **TypeScript** — everywhere
- **PostgreSQL** — via Neon (production) / Docker (local)
- **Prisma** — ORM
- **Resend** — transactional email
- **Tailwind CSS** — styling

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) (for local PostgreSQL)
- [Git](https://git-scm.com/)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd kinklist
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local values. See `.env.example` for required variables.

### 4. Start the local database

```bash
docker compose up -d
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Run pending migrations |
| `npx prisma generate` | Regenerate Prisma Client |
| `docker compose up -d` | Start local PostgreSQL |
| `docker compose down` | Stop local PostgreSQL |

## Project Structure

```
app/            — Pages and layouts (Next.js App Router)
app/api/        — API route handlers
components/     — Reusable React components
lib/            — Shared utilities, database client, auth helpers
prisma/         — Schema and migrations
```

## Email in Development

When `RESEND_API_KEY` is not set, magic link URLs and notification emails are logged to the server console instead of being sent. No email service setup is needed for local development.
