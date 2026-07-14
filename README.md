# Played & Felt 🎵

Played & Felt is a Spotify companion + mood journal. You play music in Spotify, then use Played & Felt to log how you felt and what was going on.

---

## Project Overview

Played & Felt is a full-stack web app built with the MERN stack that runs **alongside Spotify** (not as a replacement player).  
Users **log in with Google**, connect Spotify for music data, search for tracks, and create journal entries tied to mood + optional song context.

The goal is simple: Spotify tells me what I played, Played & Felt tracks how I felt.

### Auth architecture

Played & Felt uses **two separate OAuth flows**:

| Provider    | Purpose                                       | When                                        |
| ----------- | --------------------------------------------- | ------------------------------------------- |
| **Google**  | App login — who you are                       | First visit — "Log in with Google"          |
| **Spotify** | Music data — search, now playing, track links | After login — "Connect Spotify" in Settings |

> **Why Google for login?** I do not have Spotify Premium, so app login is handled by Google OAuth. Spotify OAuth is still used for music data access.

Sessions use a **JWT stored in an HTTP-only cookie** after Google login.

### How it works (current scope)

1. **Log in** with Google (OAuth 2.0)
2. **Connect Spotify** (second OAuth for music data access)
3. **Search** artists, albums, and tracks
4. **Open tracks in Spotify** from search results
5. **Write a journal entry** with mood + note (+ optional song context)

---

## Features

### Current class scope (what I am building now)

- **Google OAuth 2.0 login** — App identity and session creation.
- **JWT in HTTP-only cookie** — Persistent session and protected routes.
- **Spotify OAuth 2.0 connection** — Separate connect flow for Spotify Web API access.
- **Search** — Artists, albums, songs from Spotify Web API.
- **No Results state** — Empty state when there is no query or no API results.
- **Open in Spotify links** — Search results link out to Spotify.
- **Journal entry (core)** — Mood + note with optional song context.

### Spotify features (requires Connect Spotify)

- **Now Playing (stretch for class / likely in final submit)** — Pull from Spotify `currently-playing`.

### Post-class features (planned for September, barring setbacks)

These are still part of the product vision, but they are intentionally deferred so I can ship class requirements cleanly first.

- Timeline filters and richer entry browsing
- Insights dashboard (mood breakdown, top tracks, activity trends)
- Streak tracker
- Export entries (JSON)
- Reflection prompts / expanded settings
- Mood-based playlist tools

### Settings (current)

- Connect / reconnect Spotify
- Basic account/session controls

### Settings (post-class)

- Default mood preferences
- Reflection prompts
- Export entries

---

## Pages (current scope)

- **Login** — Google OAuth gate before app access.
- **Today** — mood + note journal entry, optional song context.
- **Search** — Spotify artist/album/song search with external links.
- **Settings** — connect/reconnect Spotify and account basics.

---

## Prerequisites

### Software

| Requirement | Version | Notes                                                                     |
| ----------- | ------- | ------------------------------------------------------------------------- |
| Docker      | Latest  | [Download Docker Desktop](https://www.docker.com/products/docker-desktop) |
| Git         | Latest  | [Download here](https://git-scm.com)                                      |

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
git clone https://github.com/SearcyTyQuerria-FS/Played-Felt.git
cd Played-Felt
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

**Google credentials:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) → select your FlowState Google Cloud project
2. APIs & Services → OAuth consent screen → configure (External, add test users)
3. Credentials → Create OAuth client ID → Web application
4. Authorized redirect URI: `http://127.0.0.1:5001/auth/google/callback`
5. Copy Client ID and Client Secret into `.env`

**Spotify credentials** (for Connect Spotify later):

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create an app (select **Web API**)
3. Copy `Client ID` and `Client Secret`
4. Set Redirect URI to `http://127.0.0.1:5001/auth/spotify/callback`

**MongoDB URI:**

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Connect → copy connection string
3. Add to `.env`

**JWT secret:** Run `openssl rand -base64 32`

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
Played-Felt/
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

- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB + Mongoose
- Auth: Google OAuth (login), Spotify OAuth (music), JWT cookie session
- API: Spotify Web API
- Local dev: Docker + Docker Compose

---

## API & OAuth flows (current)

- App login: `GET /auth/google` -> callback -> JWT cookie
- Connect Spotify: `GET /auth/spotify` -> callback -> save user tokens
- Search: `GET /search` for artists/albums/tracks
- Open in Spotify: external links to `open.spotify.com`

Played & Felt is a companion app. Playback still happens in Spotify.

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

## Deployment (later)

I am focusing on local/class delivery first.  
Deployment setup will happen after the core app is stable.

---

## Timeline & Roadmap

### By class deadline (current month)

- Deliver stable auth + Spotify integration + search + no-results UX
- Keep journal functionality as a core part of the app
- Prioritize reliability over feature count

### Post-class target (September, barring setbacks)

- Expand analytics and insight views
- Build richer timeline interactions
- Add export / quality-of-life settings
- Explore mood-based playlist workflows

---

## Portfolio Notes

I built this because Spotify tracks what I listen to, but not how I felt while listening.

Played & Felt is my way of combining both: music context + short mood journaling.

I changed scope on purpose for class: ship auth/search/journal well first, then expand features after class instead of rushing everything in one month.

---

## License

This project is for educational and portfolio purposes.
