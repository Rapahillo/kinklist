# KinkList — Functionality & Requirements

## Context

**KinkList** is a full-stack web application for people with sexual fantasies, BDSM interests, and kinks. It allows users to create and share todo lists with partners for tracking desires, fantasies, and experiences they want to explore together.

**Core use case:** User A creates a list and adds User B as a collaborator. User A adds items describing fantasies they want to explore (e.g., "I want to be spanked while shackled"). User B receives an email notification with a link to the list. Both users can view, add, edit, and complete items on the shared list.

Under the hood, KinkList is a shared todo application with a simple, passwordless multi-user model. Users are identified by email — no registration or login flow. The app supports personal lists that can be shared and collaboratively edited via unique URLs.

---

## User Model & Access

- **Passwordless magic link authentication** — the app uses email as the sole user identifier
- On the landing page, the user enters their email address
- The app sends an email containing a **magic login link** with a unique, time-limited token
- Clicking the link takes the user to their **dashboard** showing all lists associated with that email
- No passwords, no OAuth — email verification is the only security layer
- First-time users are created implicitly when they request their first magic link
- Sessions expire after **3 days** (shorter than typical due to data sensitivity)
- This prevents unauthorized access by guessing emails — you must have access to the email inbox to reach the dashboard
- **Authentication is required for ALL access** — there is no anonymous or unauthenticated access to any list content
- Magic link requests are **rate limited** (3 per email/hour, 10 per IP/hour) to prevent abuse

## Todo Lists

- Each user can create multiple todo lists
- Each list has a **unique hash** (e.g., `/list/a3f9b2c1`) that serves as a shareable URL
- Lists are accessible via:
  1. The user's **dashboard** (all lists tied to their email)
  2. A **direct hash URL** (anyone with the link can view and edit)

## Sharing & Collaboration

- Any list can be shared by copying its hash URL
- **Hash URLs require authentication** — the URL serves as an identifier/invitation, not an open-access pass. Users must log in and be authorized (owner or collaborator) to view the list
- A list owner can **add collaborators by email** — when User A adds User B's email to a list, that list appears on User B's dashboard
- All collaborators have equal edit access (read/write items and tags)
- **Privacy of collaborator identities:** the list owner sees collaborator emails; other collaborators see only **nicknames** (never each other's emails)
- Each list displays its **collaborators** (by nickname) — the list owner can assign a **nickname** to each collaborator for easier identification
- Nicknames are per-list (e.g., the same email can have different nicknames on different lists)
- If no nickname is set, non-owner collaborators see a generic label (e.g., "Collaborator") instead of the email

### Notification Emails

- When a new item is added to a list that has collaborators, **send an email notification** to all collaborators (except the person who added the item)
- The email includes: the item title and a link to the list
- Notifications should be batched or debounced to avoid spamming (e.g., if 5 items are added in quick succession, send one summary email instead of 5)

## Todo Items

Each todo item has:
- **Title** (required) — short description of the task
- **Description** (optional) — longer details about the task
- **Status** — open or completed
- **Category / tag** (optional) — one or more labels for organization
- **Created at** — timestamp
- **Created by** — user ID of the creator (resolved to nickname in the UI; email never exposed to non-owners)

> **UX note:** Only the title is prominent. All optional fields (description, tags) should be unobtrusive — shown on expand/click or via subtle controls, not cluttering the default view.

## Filtering & Sorting

Users can:
- Filter todos by: status (open/completed/archived), category/tag
- Sort todos by: creation date, status
- Combine filters (e.g., "show open items with a specific tag")

## Pages / Views

1. **Landing page** — email entry form; submitting sends a magic login link to the user's inbox
2. **Dashboard** — list of all todo lists for the current email; options to create a new list or **delete** an existing list
3. **List view** — the main interface for a single todo list: view, add, edit, complete, delete items; manage collaborators; filtering and sorting controls
4. **Shared list view** — same as list view but accessed via hash URL (requires login; redirects to auth flow if not authenticated)

## Security & Privacy

Given the sensitive nature of the content (sexual fantasies, kinks, BDSM interests), security and privacy are paramount. A data leak could cause serious personal harm.

### Core Principles

- **No anonymous access** — all list content requires authentication + authorization
- **Authorization on every request** — every API call verifies the user is the owner or collaborator of the specific list
- **PII minimization** — emails are only visible to list owners; collaborators see nicknames; item creator is stored as userId (not email)
- **Defense in depth** — security headers, input validation, rate limiting, IDOR prevention, audit logging

### Access Control

- **Owner:** full control (CRUD list, items, tags, collaborators; sees collaborator emails)
- **Collaborator:** read/write items and tags; sees collaborator nicknames only
- **Other authenticated users:** 403 Access Denied
- **Unauthenticated:** redirect to login

### Audit Trail

- Security-relevant actions (list access, collaborator changes, session events) are logged
- Item content is never logged — only action metadata
- List owners can view access history for their lists

## Verification

- Manually test the full flow: enter email → create list → add items with priorities/dates/tags → share URL → open in incognito → edit as collaborator → verify changes appear on original user's dashboard
- Run automated tests (unit + integration) for API endpoints and data layer
- Test responsive layout on mobile viewport sizes
