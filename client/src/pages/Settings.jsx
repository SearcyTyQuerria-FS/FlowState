import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001";

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch(`${API_URL}/api/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          setError("not logged in — go log in with google first");
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setError("could not reach the api");
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, []);

  function handleConnectSpotify() {
    // full redirect to backend oauth, fetch wont work for this
    window.location.href = `${API_URL}/auth/spotify`;
  }

  async function handleLogout() {
    setError("");
    setLoggingOut(true);

    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setError("could not log out");
        return;
      }

      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      setError("could not reach the api");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <section aria-labelledby="settings-heading" className="mx-auto max-w-3xl">
      <header className="mb-6 sm:mb-8">
        <h1
          id="settings-heading"
          className="text-2xl font-bold text-pf-text sm:text-3xl"
        >
          Settings
        </h1>
        <p className="mt-2 text-sm text-pf-text-secondary">
          Account and music connections
        </p>
      </header>

      {loading && <p className="text-sm text-pf-text-secondary">Loading...</p>}

      {error && <p className="mb-4 text-sm text-pf-danger">{error}</p>}

      {!loading && user && (
        <>
          <article className="mb-4 rounded-xl border border-pf-border bg-pf-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-pf-text">Account</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-pf-text-secondary">Name</dt>
                <dd className="text-pf-text">{user.name || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-pf-text-secondary">Email</dt>
                <dd className="truncate text-pf-text">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-pf-text-secondary">Google</dt>
                <dd className="text-pf-spotify">Connected</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-4 rounded-lg border border-pf-border px-3 py-1.5 text-sm text-pf-text-secondary hover:border-pf-danger hover:text-pf-danger disabled:opacity-60"
            >
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </article>

          <article className="rounded-xl border border-pf-border bg-pf-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-pf-text">
              Connections
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-pf-text">Spotify</p>
                <p className="text-sm text-pf-text-secondary">
                  {user.spotifyConnected
                    ? "Connected — used for search, now playing, and music data"
                    : "Not connected yet — needed for search and now playing"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`rounded-lg border px-2.5 py-1 text-xs ${
                    user.spotifyConnected
                      ? "border-pf-spotify bg-[#0d3a1a] text-pf-spotify"
                      : "border-pf-border bg-pf-bg text-pf-text-secondary"
                  }`}
                >
                  {user.spotifyConnected ? "Connected" : "Not connected"}
                </p>

                <button
                  type="button"
                  onClick={handleConnectSpotify}
                  className="rounded-lg border border-pf-spotify bg-[#0d3a1a] px-3 py-1.5 text-sm text-pf-spotify hover:opacity-90"
                >
                  {user.spotifyConnected
                    ? "Reconnect Spotify"
                    : "Connect Spotify"}
                </button>
              </div>
            </div>
          </article>
        </>
      )}
    </section>
  );
}

export default Settings;
