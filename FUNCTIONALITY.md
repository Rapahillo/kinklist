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
- The magic link / session should have a reasonable expiry (e.g., 7 days) so users don't need to re-authenticate constantly
- This prevents unauthorized access by guessing emails — you must have access to the email inbox to reach the dashboard

## Todo Lists

- Each user can create multiple todo lists
- Each list has a **unique hash** (e.g., `/list/a3f9b2c1`) that serves as a shareable URL
- Lists are accessible via:
  1. The user's **dashboard** (all lists tied to their email)
  2. A **direct hash URL** (anyone with the link can view and edit)

## Sharing & Collaboration

- Any list can be shared by copying its hash URL
- **Anyone with the URL can view and edit** the list (no permission tiers)
- A list owner can **add collaborators by email** — when User A adds User B's email to a list, that list appears on User B's dashboard
- All collaborators have equal edit access
- Each list displays its **collaborators** (by email) — the list owner can assign a **nickname** to each collaborator for easier identification
- Nicknames are per-list (e.g., the same email can have different nicknames on different lists)

### Notification Emails

- When a new item is added to a list that has collaborators, **send an email notification** to all collaborators (except the person who added the item)
- The email includes: the item title and a link to the list
- Notifications should be batched or debounced to avoid spamming (e.g., if 5 items are added in quick succession, send one summary email instead of 5)

## Todo Items

Each todo item has:
- **Title** (required) — short description of the task
- **Description** (optional) — longer details about the task
- **Status** — open or completed
- **Priority** (optional) — low, medium, high
- **Due date** (optional) — deadline
- **Category / tag** (optional) — one or more labels for organization
- **Created at** — timestamp
- **Created by** — email of the user who created the item

> **UX note:** Only the title is prominent. All optional fields (description, priority, due date, tags) should be unobtrusive — shown on expand/click or via subtle controls, not cluttering the default view.

## Filtering & Sorting

Users can:
- Filter todos by: status (open/completed/archived), priority, category/tag, due date range
- Sort todos by: priority, due date, creation date, status
- Combine filters (e.g., "show high-priority open items due this week")

## Pages / Views

1. **Landing page** — email entry form; submitting sends a magic login link to the user's inbox
2. **Dashboard** — list of all todo lists for the current email; options to create a new list or **delete** an existing list
3. **List view** — the main interface for a single todo list: view, add, edit, complete, delete items; manage collaborators; filtering and sorting controls
4. **Shared list view** — same as list view but accessed via hash URL (no dashboard context)

## Verification

- Manually test the full flow: enter email → create list → add items with priorities/dates/tags → share URL → open in incognito → edit as collaborator → verify changes appear on original user's dashboard
- Run automated tests (unit + integration) for API endpoints and data layer
- Test responsive layout on mobile viewport sizes
