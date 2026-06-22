# Marathon Scan

A Next.js marathon QR checkpoint scanning system. Marshals scan participant bib QR codes (`RN001`, `RN002`, …) at checkpoints without stopping the camera. Includes a live dashboard and public leaderboard.

## Features

- **Continuous QR scanning** — camera stays active; dedup prevents double-scans
- **Checkpoint marshal stations** — bookmarkable URLs per checkpoint
- **Live dashboard** — stats, activity feed, participant search, printable QR sheet
- **Leaderboard** — auto-refreshing rankings with TV auto-scroll mode
- **Brutalist UI** — white + neo green design system on Tailwind CSS v4

## Quick Start

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open [Try website here]([http://localhost:3000](https://marathon-tracker.duckdns.org/))

## Marshal Checkpoint URLs

Share these URLs with marshals at each station:

| Checkpoint | URL |
|------------|-----|
| Starting Line | `/marshal/start` |
| CP 1 | `/marshal/cp1` |
| CP 2 | `/marshal/cp2` |
| Finish Line | `/marshal/finish` |

**Note:** Camera requires HTTPS or `localhost`. Allow camera permission when prompted.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home — links to all sections |
| `/dashboard` | Admin dashboard with live stats |
| `/leaderboard` | Public rankings |
| `/marshal/[checkpoint]` | Full-screen QR scanner |

## API

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/scans` | Record scan `{ bibNumber, checkpointSlug }` |
| GET | `/api/scans?limit=20` | Recent scans |
| GET | `/api/stats` | Aggregate counts |
| GET | `/api/leaderboard` | Ranked participants |
| GET | `/api/participants?search=RN` | Search participants |
| GET | `/api/qr/[bib]` | QR code PNG for a bib |

## Seed Data

- 4 checkpoints: Start, CP1, CP2, Finish
- 50 participants: `RN001` – `RN050`

Reset and re-seed:

```bash
npm run db:reset
```

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Prisma + SQLite
- @zxing/browser (QR scanning)
- SWR (live polling)

## Production

```bash
npm run build
npm start
```

For Vercel deployment, set `DATABASE_URL` to a persistent SQLite path or switch to PostgreSQL.
