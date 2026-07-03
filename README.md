# FlowState 🎵

> A Spotify companion and mood journal. Play music in Spotify, log how you feel in FlowState — with the songs that soundtrack each moment.

---

## Project Overview

FlowState is a full-stack web application built on the MERN stack that runs **alongside Spotify** (like Last.fm). It does not replace Spotify for playback. Users connect via **Spotify OAuth 2.0**, search for music, see what's currently playing, and write mood journal entries with optional song context.

**Product pitch:** Spotify shows what you played — FlowState captures *how you felt* and *why*, with the music attached.

### How it works

1. **Log in** with Spotify (OAuth 2.0)
2. **Play music in Spotify** (desktop, mobile, or web)
3. **Open FlowState** — see now playing, pick a mood, write a note
4. **Add a song to your entry** from now playing or Search
5. **Browse Timeline & Insights** — patterns, streaks, top tracks by mood

---

## Features

### Auth & Spotify (required)

- **Spotify OAuth 2.0** — Secure login via Spotify. JWT stored in the database with automatic token refresh.
- **Search** — Search artists, albums, and songs via the Spotify Web API. Results link to Spotify player URLs.
- **No Results State** — Empty state when no query has been entered or the API returns nothing.

### Companion & journal

- **Now Playing** — Live-sync from Spotify (`currently-playing`). Open track in Spotify with one click.
- **Add to Entry** — Attach the current track (or a song from Search) to a journal entry.
- **Mood Selector** — Six moods with distinct visual identity: Rage, Focused, Sad, Hype, Faith, Chill.
- **Journal Entries** — Mood + note + optional tags + optional Spotify track, saved to MongoDB.
- **Timeline** — Browse past entries, filter by mood, open attached tracks in Spotify.
- **Insights** — Entry counts, mood breakdown, peak journaling time, top tracks by mood, weekly summary card.
- **Streak Tracker** — Consecutive days with at least one journal entry.

### Settings

- Default mood, reflection prompts, now-playing sync toggle
- Export entries (JSON)
- Reconnect Spotify, clear journal data

---

## Pages

| Page | Description |
| ---- | ----------- |
| **Login** | Spotify OAuth gate — must connect before using the app |
| **Today** | Now playing, mood picker, journal note, save entry |
| **Search** | Artists, albums, songs — open in Spotify or add song to entry |
| **Timeline** | Journal history with mood filters and streak |
| **Insights** | Stats, mood breakdown, top tracks by mood |
| **Settings** | Profile, journal prefs, account |

> **Design mockup:** See `flowstate_full_mockup.html` in Downloads for the full UI reference.

---

## Prerequisites

### Software

| Requirement | Version | Notes |
| ----------- | ------- | ----- |
| Docker | Latest | [Download Docker Desktop](https://www.docker.com/products/docker-desktop) |
| Git | Latest | [Download here](https://git-scm.com) |

### Accounts & API Access

- **Spotify Developer Account** — Register at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard). Create a **Web API** app and set your redirect URI.

  > **Important (2026):** Development Mode requires the **app owner** to have an active **Spotify Premium** subscription. Dev apps are limited to **5 authorized users**. Add testers in the Developer Dashboard under Users Management.

- **MongoDB Atlas** — Free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/flowstate.git
cd flowstate
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
JWT_SECRET=your_jwt_secret_here
MONGO_URI=your_mongodb_uri_here
```

> **Spotify credentials:**
>
> 1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
> 2. Create an app (select **Web API**)
> 3. Copy `Client ID` and `Client Secret`
> 4. Set Redirect URI to `http://127.0.0.1:5001/auth/callback`
> 5. Add authorized users under **Users Management** (dev mode, max 5)

> **MongoDB URI:**
>
> 1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
> 2. Connect → copy connection string
> 3. Add to `.env`

> **JWT secret:** Run `openssl rand -base64 32`

### 3. Run with Docker

```bash
docker compose up --build
```

This will:

- Build the Express backend and React frontend images
- Start MongoDB
- Start the backend on `http://127.0.0.1:5001`
- Start the frontend on `http://127.0.0.1:3000`

### 4. Open in Browser

Visit `http://127.0.0.1:3000`. Click **Connect with Spotify** to log in, then use Today to journal or Search to find music.

### To Stop

```bash
docker compose down
```

---

## Links

- **Frontend:** <http://127.0.0.1:3000>
- **Backend API:** <http://127.0.0.1:5001>
- **MongoDB (local):** mongodb://127.0.0.1:27017
- **Spotify Developer Dashboard:** <https://developer.spotify.com/dashboard>
- **MongoDB Atlas:** <https://www.mongodb.com/atlas>

---

## Project Structure

```text
flowstate/
├── client/                 # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Login, Today, Search, Timeline, Insights, Settings
│   │   ├── hooks/          # Custom React hooks
│   │   └── main.jsx        # App entry point
│   ├── Dockerfile
│   └── package.json
│
├── server/                 # Express backend
│   ├── routes/             # API route handlers (auth, entries, search, spotify)
│   ├── controllers/        # Business logic
│   ├── models/             # Mongoose schemas (User, JournalEntry)
│   ├── middleware/         # Auth middleware, JWT validation
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .dockerignore
├── .env                    # Never commit this
└── README.md
```

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | Spotify OAuth 2.0, JWT |
| Containerization | Docker, Docker Compose |
| Third-Party API | Spotify Web API |
| Deployment | Vercel (frontend), Heroku (backend) |

---

## Spotify API Usage

| Feature | Endpoint / flow |
| ------- | ---------------- |
| Login | OAuth 2.0 Authorization Code |
| Search | `GET /search` (artists, albums, tracks) |
| Now playing | `GET /me/player/currently-playing` |
| Open in Spotify | External links to `open.spotify.com` |

FlowState is a **companion app** — playback happens in Spotify, not inside FlowState.

---

## Development

Without Docker:

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev

# Terminal 2 — Frontend
cd client
npm install
npm run dev
```

Frontend dev server: `http://127.0.0.1:5173`

---

## Deployment

- **Frontend:** [Vercel](https://vercel.com)
- **Backend:** [Heroku](https://www.heroku.com)

Add all `.env` variables to your hosting platform. **Do not commit `.env` to the repository.**

Update the Spotify redirect URI in the Developer Dashboard to match your production backend URL.

---

## Planned (v2)

- **Mood-based playlists** — Build Spotify playlists from songs you've logged on past entries for a given mood (e.g. all tracks from Rage entries → "Your Rage Soundtrack"). Uses your journal data, not AI recommendations. Triggered from Insights via a **Create playlist** action; creates or updates a playlist in Spotify through the Web API.
- **Fallback if dev-mode limits apply** — Show a mood-based track list in FlowState with per-track **Open in Spotify** links if playlist creation endpoints are restricted.

---

## Portfolio Notes

**Problem:** Spotify tracks listening history, not emotional context or intention.

**Solution:** A mood journal companion that ties entries to Spotify tracks — patterns from real behavior, not AI-generated playlists.

**Differentiator:** Journal-first product with Spotify as identity + context layer (companion model, not a mood-AI recommender).

---

## License

This project is for educational and portfolio purposes.
