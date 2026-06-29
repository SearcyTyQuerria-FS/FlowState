# FlowState 🎵

> Your music, finally intelligent. A mood-aware Spotify companion that tracks how you listen, surfaces insights you've never seen, and keeps your sessions intentional.

---

## Project Overview

FlowState is a full-stack web application built on the MERN stack that connects to the Spotify Web API to deliver a mood-driven listening experience. Instead of just playing music, FlowState asks how you're feeling before every session — Rage, Focused, Sad, Hype, Faith, or Chill — and tracks that emotional context over time.

### Features

- **Spotify OAuth 2.0 Authentication** — Secure login via Spotify. JWT is stored in the database and automatically refreshed when expired. No re-login needed while your token is valid.
- **Mood Selector** — Choose your mood before every session. Each mood has its own visual identity and color.
- **Mood-Aware Dashboard** — See your currently playing track, your active mood, and a weekly snapshot of your listening behavior.
- **My Stats** — A deep-dive stats page showing total listening time, top mood, peak listening hours, mood breakdown percentages, and top artists sorted by the mood you listen to them in.
- **Session History** — Every listening session is logged with mood, duration, track count, and timestamp. Filter by mood to find past sessions.
- **Clean Mode** — A session-level toggle that filters explicit tracks. When enabled, FlowState swaps for the clean version of a track if available via the Spotify API.
- **Streak Tracker** — Tracks consecutive days you've logged a session.
- **No Results State** — Friendly empty state displayed when no search has been performed or the API returns no results.
- **Search** — Search for artists and tracks. Each result links directly to the Spotify Web Player.

---

## Prerequisites

Make sure you have the following installed before running FlowState locally.

### Software

| Requirement | Version   | Notes                                                          |
| ----------- | --------- | -------------------------------------------------------------- |
| Docker      | Latest    | [Download Docker Desktop](https://www.docker.com/products/docker-desktop) |
| Git         | Latest    | [Download here](https://git-scm.com)                            |

### Accounts & API Access

- **Spotify Developer Account** — Required to generate your `CLIENT_ID` and `CLIENT_SECRET`. Register your app at [developer.spotify.com](https://developer.spotify.com/dashboard).

---

## Getting Started

Follow these steps to get a local copy of FlowState up and running with Docker.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/flowstate.git
cd flowstate
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with your Spotify credentials:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
JWT_SECRET=your_custom_jwt_secret_here
```

> **How to get your Spotify credentials:**
>
> 1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
> 2. Click **Create App**
> 3. Set the Redirect URI to `http://localhost:5001/auth/callback`
> 4. Copy your `Client ID` and `Client Secret` into the `.env` file above

### 3. Run with Docker

```bash
docker compose up --build
```

This will:
- Build the Express backend image
- Build the React frontend image
- Start MongoDB
- Start the backend on `http://localhost:5001`
- Start the frontend on `http://localhost:3000`

### 4. Open in Browser

Visit `http://localhost:3000` in your browser. If no JWT is stored, you'll see the login screen. Click **Connect with Spotify** to authenticate and get started.

### To Stop

```bash
docker compose down
```

---

## Project Structure

```text
flowstate/
├── client/                 # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Dashboard, Stats, Sessions, Settings
│   │   ├── hooks/          # Custom React hooks
│   │   └── main.jsx        # App entry point
│   ├── Dockerfile
│   └── package.json
│
├── server/                 # Express backend
│   ├── routes/             # API route handlers
│   ├── controllers/        # Business logic
│   ├── models/             # Mongoose schemas
│   ├── middleware/         # Auth middleware, JWT validation
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Docker orchestration
├── .dockerignore            # Docker build exclusions
├── .env                     # Environment variables (never commit this)
└── README.md
```

---

## Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Frontend        | React 18, Vite, Tailwind CSS         |
| Backend         | Node.js, Express.js                  |
| Database        | MongoDB, Mongoose                    |
| Auth            | Spotify OAuth 2.0, JWT               |
| Containerization| Docker, Docker Compose               |
| Third-Party API | Spotify Web API                      |
| Deployment      | Vercel (frontend), Heroku (backend)  |

---

## Development

To run the application locally without Docker:

```bash
# Terminal 1 — Backend (requires MongoDB running locally)
cd server
npm install
npm run dev

# Terminal 2 — Frontend
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` for the frontend.

---

## Deployment

- **Frontend** is deployed on [Vercel](https://vercel.com)
- **Backend** is deployed on [Heroku](https://www.heroku.com)

When deploying, add all environment variables from your `.env` file directly into your hosting platform's environment settings. **Do not push your `.env` file to your repository.**

---

## License

This project is for educational and portfolio purposes.
