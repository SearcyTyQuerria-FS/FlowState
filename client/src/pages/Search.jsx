import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001";

function trackFromSearchItem(item) {
  if (!item || item.type !== "Song") return null;

  // Search cards use "Song · Artist Name"
  const parts = (item.subtitle || "").split("·");
  const artist = parts.length > 1 ? parts.slice(1).join("·").trim() : "";

  return {
    spotifyId: item.id,
    name: item.title,
    artist,
    url: item.url,
    image: item.image || null,
  };
}

function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsSpotify, setNeedsSpotify] = useState(false);

  function handleAddToToday(item) {
    const track = trackFromSearchItem(item);
    if (!track) return;
    // hand the song off to Today through navigate state
    navigate("/today", { state: { track } });
  }

  async function handleSearch(event) {
    event.preventDefault();

    const trimmed = query.trim();
    setError("");
    setNeedsSpotify(false);
    setHasSearched(true);

    if (!trimmed) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({ q: trimmed });
      const res = await fetch(`${API_URL}/api/search?${params}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsSpotifyAuth) {
          setNeedsSpotify(true);
          setError("connect spotify in settings first — search needs it");
        } else if (res.status === 401) {
          setError("not logged in — go log in with google first");
        } else {
          setError(data.error || "search failed");
        }
        setResults([]);
        return;
      }

      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setError("could not reach the api");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const showIdle = !hasSearched && !loading;
  const showEmpty = hasSearched && !loading && results.length === 0 && !error;

  return (
    <section aria-labelledby="search-heading" className="mx-auto max-w-3xl">
      <header className="mb-6 sm:mb-8">
        <h1
          id="search-heading"
          className="text-2xl font-bold text-pf-text sm:text-3xl"
        >
          Search
        </h1>
        <p className="mt-2 text-sm text-pf-text-secondary">
          Find artists, albums, and songs from Spotify
        </p>
      </header>

      <form onSubmit={handleSearch} className="mb-6" role="search">
        <label htmlFor="search-input" className="sr-only">
          Search Spotify
        </label>
        <div className="flex flex-col gap-3 rounded-xl border border-pf-border bg-pf-card p-3 sm:flex-row sm:items-center sm:px-4 sm:py-3">
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for artist, album, or song..."
            className="w-full bg-transparent px-1 py-1 text-pf-text outline-none placeholder:text-pf-inactive"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-pf-border-active bg-pf-hover px-3 py-2 text-sm font-medium text-pf-text hover:opacity-90 disabled:opacity-60 sm:w-auto sm:py-1.5"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mb-4 rounded-lg border border-pf-danger/40 bg-pf-card px-3 py-2 text-sm text-pf-danger">
          {error}
          {needsSpotify && (
            <>
              {" "}
              <Link to="/settings" className="text-pf-accent hover:underline">
                Open Settings
              </Link>
            </>
          )}
        </p>
      )}

      {loading && (
        <div className="rounded-xl border border-dashed border-pf-border bg-pf-card px-6 py-12 text-center">
          <p className="text-sm text-pf-text-secondary">Searching Spotify...</p>
        </div>
      )}

      {showIdle && (
        <div className="rounded-xl border border-dashed border-pf-border bg-pf-card px-6 py-12 text-center sm:py-16">
          <p className="mb-3 text-3xl text-pf-inactive" aria-hidden="true">
            ♪
          </p>
          <h2 className="text-lg font-semibold text-pf-text sm:text-xl">
            Start a search
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-pf-text-secondary leading-relaxed">
            Type an artist, album, or song. Results open in Spotify or can be
            added to today&apos;s journal entry.
          </p>
        </div>
      )}

      {showEmpty && (
        <div className="rounded-xl border border-dashed border-pf-border bg-pf-card px-6 py-12 text-center sm:py-16">
          <h2 className="text-lg font-semibold text-pf-text sm:text-xl">
            No Results
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-pf-text-secondary leading-relaxed">
            Nothing matched that query. Try a different spelling or a shorter
            search term.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <ul className="space-y-3">
          {results.map((item) => (
            <li
              key={`${item.type}-${item.id}`}
              className="flex flex-col gap-3 rounded-xl border border-pf-border bg-pf-card p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <p
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-pf-hover text-pf-accent"
                    aria-hidden="true"
                  >
                    ♪
                  </p>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-pf-text">
                    {item.title}
                  </p>
                  <p className="truncate text-sm text-pf-text-secondary">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
                {item.type === "Song" && (
                  <button
                    type="button"
                    onClick={() => handleAddToToday(item)}
                    className="rounded-lg border border-pf-border-active bg-pf-hover px-3 py-1.5 text-sm text-pf-text hover:opacity-90"
                  >
                    Add to Today
                  </button>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-pf-spotify bg-[#0d3a1a] px-3 py-1.5 text-sm text-pf-spotify hover:opacity-90"
                  >
                    Open in Spotify
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Search;
