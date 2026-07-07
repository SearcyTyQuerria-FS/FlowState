# FlowState 🎵

> A Spotify companion and mood journal. Play music in Spotify, log how you feel in FlowState — with the songs that soundtrack each moment.

---

## Project Overview

FlowState is a full-stack web application built on the MERN stack that runs **alongside Spotify** (like Last.fm). It does not replace Spotify for playback. Users **log in with Google**, optionally **connect Spotify** for music features, search for music, see what's currently playing, and write mood journal entries with optional song context.

**Product pitch:** Spotify shows what you played — FlowState captures *how you felt* and *why*, with the music attached.

### Auth architecture

FlowState uses **two separate OAuth flows**:

| Provider | Purpose | When |
| -------- | ------- | ---- |
| **Google** | App login — who you are | First visit — "Log in with Google" |
| **Spotify** | Music data — search, now playing, track links | After login — "Connect Spotify" in Settings |

> **Why Google for login?** Spotify Developer Mode now requires a Premium subscription for OAuth. Google handles authentication; Spotify remains the music integration. This is **Google Cloud OAuth 2.0** (credentials from [Google Cloud Console](https://console.cloud.google.com/)) — not Firebase Auth.

Sessions use a **JWT stored in an HTTP-only cookie** after Google login.

### How it works

1. **Log in** with Google (OAuth 2.0)
2. **Connect Spotify** (second OAuth — optional until you need music features)
3. **Play music in Spotify** (desktop, mobile, or web)
4. **Open FlowState** — see now playing, pick a mood, write a note
5. **Add a song to your entry** from now playing or Search
6. **Browse Timeline & Insights** — patterns, streaks, top tracks by mood

---

## Features

### Auth & accounts

- **Google OAuth 2.0** — App login via Google Cloud Console. User profile saved to MongoDB; session JWT issued in an HTTP-only cookie.
- **Spotify OAuth 2.0** — Separate "Connect Spotify" flow for music API access (search, now playing). Tokens stored on the user record after Google login.

### Spotify features (requires Connect Spotify)

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
- Connect / reconnect Spotify, clear journal data

---

## Pages

| Page | Description |
| ---- | ----------- |
| **Login** | Google OAuth gate — must log in before using the app |
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

- **Google Cloud project** — For app login. Create an OAuth 2.0 Web client at [console.cloud.google.com](https://console.cloud.google.com/) (APIs & Services → Credentials). This is **not** Firebase — you use Google's OAuth endpoints directly from Express.

  > **Setup:** OAuth consent screen (External) → add yourself as a test user → create Web application client → redirect URI `http://127.0.0.1:5001/auth/google/callback`

- **Spotify Developer Account** — For music features only (Connect Spotify). Register at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard). Create a **Web API** app.

  > **Note:** Spotify OAuth is used for **music API access**, not login. Dev mode may require Premium for the app owner; Google handles authentication instead.

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
# Google — app login
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://127.0.0.1:5001/auth/google/callback
CLIENT_URL=http://127.0.0.1:3000

# App session & database
JWT_SECRET=your_jwt_secret_here
MONGO_URI=your_mongodb_uri_here

# Spotify — music features (Connect Spotify flow)
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5001/auth/spotify/callback
```

> **Google credentials:**
>
> 1. Go to [console.cloud.google.com](https://console.cloud.google.com/) → select your FlowState project
> 2. APIs & Services → OAuth consent screen → configure (External, add test users)
> 3. Credentials → Create OAuth client ID → Web application
> 4. Authorized redirect URI: `http://127.0.0.1:5001/auth/google/callback`
> 5. Copy Client ID and Client Secret into `.env`

> **Spotify credentials** (for Connect Spotify later):
>
> 1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
> 2. Create an app (select **Web API**)
> 3. Copy `Client ID` and `Client Secret`
> 4. Set Redirect URI to `http://127.0.0.1:5001/auth/spotify/callback`

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

Visit `http://127.0.0.1:3000`. Click **Log in with Google**, then **Connect Spotify** when you need music features.

### To Stop

```bash
docker compose down
```

---

## Links

- **Frontend:** <http://127.0.0.1:3000>
- **Backend API:** <http://127.0.0.1:5001>
- **MongoDB (local):** mongodb://127.0.0.1:27017
- **Google Cloud Console:** <https://console.cloud.google.com/>
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
| Auth | Google OAuth 2.0 (login), Spotify OAuth 2.0 (music), JWT (HTTP-only cookie) |
| Containerization | Docker, Docker Compose |
| Third-Party API | Spotify Web API |
| Deployment | Vercel (frontend), Heroku (backend) |

---

## API & OAuth flows

| Feature | Provider | Flow |
| ------- | -------- | ---- |
| App login | Google | `GET /auth/google` → callback → JWT cookie |
| Connect Spotify | Spotify | `GET /auth/spotify` → callback → tokens on user |
| Search | Spotify Web API | `GET /search` (artists, albums, tracks) |
| Now playing | Spotify Web API | `GET /me/player/currently-playing` |
| Open in Spotify | — | External links to `open.spotify.com` |

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

Update redirect URIs in Google Cloud Console and Spotify Developer Dashboard to match your production backend URL.

---

## Planned (v2)

- **Mood-based playlists** — Build Spotify playlists from songs you've logged on past entries for a given mood (e.g. all tracks from Rage entries → "Your Rage Soundtrack"). Uses your journal data, not AI recommendations. Triggered from Insights via a **Create playlist** action; creates or updates a playlist in Spotify through the Web API.
- **Fallback if dev-mode limits apply** — Show a mood-based track list in FlowState with per-track **Open in Spotify** links if playlist creation endpoints are restricted.

---

## Portfolio Notes

**Problem:** Spotify tracks listening history, not emotional context or intention.

**Solution:** A mood journal companion that ties entries to Spotify tracks — patterns from real behavior, not AI-generated playlists.

**Differentiator:** Journal-first product with Google for identity, Spotify for music context (companion model, not a mood-AI recommender).

---

## License

This project is for educational and portfolio purposes.
