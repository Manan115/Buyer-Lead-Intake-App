## Buyer Lead Intake – Mini App (Interview Project)

A small but production-minded app to capture, list, and manage buyer leads. Built with Next.js App Router, Drizzle ORM (SQLite), NextAuth (demo login), and Zod. It demonstrates validation on both client and server, URL-synced filters, SSR pagination, CSV import/export, ownership rules, and basic rate limiting.

---

## Setup

Prerequisites
- Node.js 18+
- Git

Clone & Run Locally

Windows PowerShell (recommended on Windows)
```powershell
# 1) Clone
git clone https://github.com/Manan115/Buyer-Lead-Intake-App.git
cd .\Buyer-Lead-Intake-App

# 2) Install deps
npm install

# 3) (Optional) Apply migrations — you can SKIP this if `sqlite.db` already exists in the repo
# If you have the sqlite3 CLI installed:
sqlite3 sqlite.db ".read drizzle\0000_illegal_thunderbird.sql"
sqlite3 sqlite.db ".read drizzle\0001_true_blacklash.sql"
sqlite3 sqlite.db ".read drizzle\0002_constraints.sql"

# 4) Start dev server
npm run dev
# then open http://localhost:3000
```

macOS/Linux (bash/zsh)
```bash
# 1) Clone
git clone https://github.com/Manan115/Buyer-Lead-Intake-App.git
cd Buyer-Lead-Intake-App

# 2) Install deps
npm install

# 3) (Optional) Apply migrations — you can SKIP this if `sqlite.db` already exists in the repo
sqlite3 sqlite.db < drizzle/0000_illegal_thunderbird.sql
sqlite3 sqlite.db < drizzle/0001_true_blacklash.sql
sqlite3 sqlite.db < drizzle/0002_constraints.sql

# 4) Start dev server
npm run dev
# then open http://localhost:3000
```

Install
```bash
npm install
```

Environment
- No external secrets are required for the demo login.
- Optional: set `NEXT_PUBLIC_BASE_URL` if you plan to call the API from another origin. For local SSR we use relative URLs.

Database (SQLite + Drizzle)
- The DB file lives at `sqlite.db`.
- Migrations are in `drizzle/` and configured via `drizzle.config.ts`.

Apply migrations
```bash
# If you use drizzle-kit runner, otherwise execute SQL manually.
# For SQLite manual apply, you can run the SQL in drizzle/*.sql against sqlite.db
# Example (using sqlite3 if installed):
#   sqlite3 sqlite.db < drizzle/0000_illegal_thunderbird.sql
#   sqlite3 sqlite.db < drizzle/0001_true_blacklash.sql
#   sqlite3 sqlite.db < drizzle/0002_constraints.sql
```

Run locally
```bash
npm run dev
# open http://localhost:3000
```

Auth (Demo login)
- Go to `/login` or `/auth/signin` and enter any username. The app uses Credentials auth and treats the username as the user id.

Tests
```bash
npx vitest run
```

---

## How it works (Design Notes)

Validation
- The main schema lives in `lib/validation/buyer.ts` (Zod).
- Client forms validate before submit and the same schema validates on API routes.
- Rules enforced: `fullName` ≥ 2 chars; phone `10–15` digits; email if provided; `budgetMax ≥ budgetMin`; `bhk` required if `propertyType ∈ {Apartment, Villa}`.
- CSV uses the same schema; `budgetMin/budgetMax` are coerced to numbers.

Data & Migrations
- Drizzle ORM with SQLite. Tables defined in `lib/db/schema.ts` and migrations in `drizzle/*`.
- `buyer_history` stores JSON diffs of changed fields.
- `0002_constraints.sql` adds a foreign key (`buyer_history.buyer_id -> buyers.id`) and helpful indexes.

Auth & Ownership
- NextAuth Credentials: any username logs in; `session.user.id` is the owner id.
- Read: any logged-in user can view all buyers.
- Edit/Delete: only the `ownerId` can mutate or delete a lead.
- History is visible to all logged-in users for transparency.

Rate Limiting
- Simple per-user in-memory limiter in `lib/ratelimit.ts` on create/update.

SSR vs Client
- `/buyers`: SSR initial page with filters/search parsed from `searchParams`, then client-side debounced updates. Real server pagination (page size 10) and `total` are returned by the API.
- Sorting default: `updatedAt desc`.
- `/buyers/new` and `/buyers/[id]`: client components for controlled forms with server APIs.

Concurrency & History
- On edit, a hidden `updatedAt` is sent; API rejects stale updates with a 409 and asks for refresh.
- `buyer_history` writes on create (full field snapshot) and on update (diff of changed fields).

Import/Export (CSV)
- Import endpoint validates up to 200 rows, aggregates per-row errors, and inserts valid rows in a single transaction.
- Export respects current filters/search/sort and streams a CSV of the current view.

UI/UX Notes
- Accessible labels and inline error text; `aria-live` announcements on validation/success; first invalid field receives focus.
- Tag chips with typeahead (`TagInput`) for both create and edit.
- Error boundary wraps main list page.

---

## What’s Done vs Skipped

Done
- Full CRUD with ownership checks (server-side), create/write history, edit/delete owner-only.
- Zod validation on client and server; conditional `bhk` and budget constraints.
- Real server pagination (10/page), default sort by `updatedAt desc`.
- URL-synced filters (`city`, `propertyType`, `status`, `timeline`) and debounced search (`fullName|phone|email`).
- CSV import (transactional), row-level error reporting, and filtered export.
- Basic rate limit on POST/PUT.
- Unit tests for validation rules (Vitest).
- ErrorBoundary, empty states, and a11y improvements.

Skipped (and why)
- Strong DB enum `CHECK` constraints in SQLite: requires table rebuild; Zod already enforces enums, and we added non-destructive indexes + FK. Could be added in a future migration.
- Full-text search (FTS5): Not required for the assignment; current search covers name/phone/email.
- File uploads (`attachmentUrl`): Out of scope for the core demo.
- Admin role: Ownership rules are sufficient for the demo; easy to extend with a role flag.

---

## Project Map
- `app/`
	- `buyers/` – List (SSR initial) and detail pages
	- `buyers/new` – Create form
	- `api/buyers/*` – REST APIs (list/create/update/delete/import/export)
- `lib/`
	- `validation/buyer.ts` – Zod schema
	- `db/schema.ts` – Drizzle schema
	- `db/client.ts` – Drizzle client (SQLite)
	- `components/*` – UI components (forms, table, tag input, etc.)
- `drizzle/` – Generated SQL migrations and meta
- `tests/` – Vitest unit tests for validation

---

## Running Notes (Local)
1) Install deps: `npm install`
2) Apply migrations: run the SQL files in `drizzle/` against `sqlite.db` (see above)
3) Start dev server: `npm run dev`
4) Login: go to `/login` and enter any username
5) Try flows: create, list/filter/search, edit (test concurrency), import/export

---

## Interview Highlights
- Same Zod schema on client + server (single source of truth).
- Server pagination + `total` for accurate UX; SSR hydration + client debounce.
- Ownership enforcement on server with simple, readable checks.
- History writes on both create and update with field-level diffs.
- CSV import transactional safety and row error reporting.
