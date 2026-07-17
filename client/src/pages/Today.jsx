import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001";

const MOODS = [
  { name: "Rage", emoji: "🔥", color: "bg-pf-rage" },
  { name: "Focused", emoji: "🧠", color: "bg-pf-focus" },
  { name: "Sad", emoji: "🌧", color: "bg-pf-sad" },
  { name: "Faith", emoji: "🙏", color: "bg-pf-faith" },
  { name: "Hype", emoji: "⚡", color: "bg-pf-hype" },
  { name: "Chill", emoji: "🍃", color: "bg-pf-chill" },
];

const TAGS = ["school", "coding", "social", "sleep", "morning"];

function getMoodMeta(name) {
  return (
    MOODS.find((item) => item.name === name) || {
      name: name || "Mood",
      emoji: "•",
      color: "bg-pf-accent",
    }
  );
}

function Today() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mood, setMood] = useState("Focused");
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [track, setTrack] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [nowPlayingLoading, setNowPlayingLoading] = useState(false);
  const [nowPlayingMessage, setNowPlayingMessage] = useState("");
  const [entries, setEntries] = useState([]);
  const [userName, setUserName] = useState("");
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  // search can send a song over with navigate state
  useEffect(() => {
    const incoming = location.state?.track;
    if (!incoming?.name) return;

    setTrack(incoming);
    // clear state so a refresh doesnt re-attach the same song
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  async function loadNowPlaying() {
    setNowPlayingLoading(true);
    setNowPlayingMessage("");

    try {
      const res = await fetch(`${API_URL}/api/currently-playing`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.needsSpotifyAuth) {
          setNowPlaying(null);
          setNowPlayingMessage("connect spotify in settings to see now playing");
        } else {
          setNowPlaying(null);
          setNowPlayingMessage(data.error || "could not load now playing");
        }
        return;
      }

      setNowPlaying(data.track || null);
      setNowPlayingMessage(
        data.track ? "" : data.message || "Nothing playing right now",
      );
    } catch (err) {
      console.error(err);
      setNowPlaying(null);
      setNowPlayingMessage("could not reach the api");
    } finally {
      setNowPlayingLoading(false);
    }
  }

  useEffect(() => {
    async function loadToday() {
      try {
        const [meRes, todayRes] = await Promise.all([
          fetch(`${API_URL}/api/me`, { credentials: "include" }),
          fetch(`${API_URL}/api/entries/today`, { credentials: "include" }),
        ]);

        if (!meRes.ok) {
          setError("not logged in — go log in with google first");
          return;
        }

        const me = await meRes.json();
        setUserName(me.name || "");
        setSpotifyConnected(Boolean(me.spotifyConnected));

        if (todayRes.ok) {
          const data = await todayRes.json();
          setEntries(data.entries || []);
        }

        // stretch: pull currently playing if spotify is connected
        if (me.spotifyConnected) {
          const npRes = await fetch(`${API_URL}/api/currently-playing`, {
            credentials: "include",
          });
          const npData = await npRes.json();

          if (npRes.ok) {
            setNowPlaying(npData.track || null);
            setNowPlayingMessage(
              npData.track
                ? ""
                : npData.message || "Nothing playing right now",
            );
          }
        }
      } catch (err) {
        console.error(err);
        setError("could not reach the api");
      } finally {
        setLoading(false);
      }
    }

    loadToday();
  }, []);

  function handleToggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleRemoveTrack() {
    setTrack(null);
  }

  function handleAddNowPlaying() {
    if (!nowPlaying?.name) return;
    setTrack(nowPlaying);
    setSavedMessage("now playing added to this entry");
  }

  async function handleDelete(entryId) {
    const confirmed = window.confirm("Delete this entry?");
    if (!confirmed) return;

    setError("");
    setSavedMessage("");
    setDeletingId(entryId);

    try {
      const res = await fetch(`${API_URL}/api/entries/${entryId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "could not delete entry");
        return;
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    } catch (err) {
      console.error(err);
      setError("could not reach the api");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSavedMessage("");

    if (!mood) {
      setError("pick a mood before saving");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/entries`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          note,
          tags: selectedTags,
          track,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "could not save entry");
        return;
      }

      // newest on top, then clear the form for the next entry
      setEntries((prev) => [data, ...prev]);
      setNote("");
      setSelectedTags([]);
      setTrack(null);
      setSavedMessage("entry saved");
    } catch (err) {
      console.error(err);
      setError("could not reach the api");
    } finally {
      setSaving(false);
    }
  }

  const greeting = userName
    ? `Hey, ${userName.split(" ")[0]}`
    : "How are you feeling?";

  return (
    <section aria-labelledby="today-heading" className="mx-auto max-w-3xl">
      <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            id="today-heading"
            className="text-2xl font-bold text-pf-text sm:text-3xl"
          >
            {greeting}
          </h1>
          <p className="mt-2 text-sm text-pf-text-secondary">
            {loading
              ? "Loading..."
              : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} logged today`}
          </p>
        </div>

        <p
          className={`w-fit rounded-lg border px-3 py-1.5 text-xs ${
            spotifyConnected
              ? "border-pf-spotify bg-[#0d3a1a] text-pf-spotify"
              : "border-pf-border bg-pf-card text-pf-text-secondary"
          }`}
        >
          {spotifyConnected ? "Spotify connected" : "Spotify not connected"}
        </p>
      </header>

      <aside className="mb-5 rounded-xl border border-pf-border bg-pf-card px-4 py-3 text-sm text-pf-text-secondary leading-relaxed sm:mb-6">
        Play music in Spotify, log your mood here. Add what&apos;s playing
        below, find a song in{" "}
        <Link to="/search" className="text-pf-accent hover:underline">
          Search
        </Link>
        , or save a note with no track.
      </aside>

      {!spotifyConnected && !loading && (
        <aside className="mb-5 rounded-xl border border-dashed border-pf-border bg-pf-card px-4 py-3 text-sm text-pf-text-secondary sm:mb-6">
          Spotify isn&apos;t connected yet — you can still journal. Connect it
          in{" "}
          <Link to="/settings" className="text-pf-accent hover:underline">
            Settings
          </Link>{" "}
          for search and now playing.
        </aside>
      )}

      {spotifyConnected && (
        <section
          className="mb-5 rounded-xl border border-pf-border bg-pf-card p-4 sm:mb-6"
          aria-labelledby="now-playing-heading"
        >
          <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2
                id="now-playing-heading"
                className="text-sm font-semibold text-pf-text"
              >
                Now playing on Spotify
              </h2>
              <p className="mt-1 text-xs text-pf-inactive">
                Stretch feature — pulls from Spotify currently-playing
              </p>
            </div>
            <button
              type="button"
              onClick={loadNowPlaying}
              disabled={nowPlayingLoading}
              className="rounded-lg border border-pf-border px-3 py-1.5 text-xs text-pf-text-secondary hover:bg-pf-hover hover:text-pf-text disabled:opacity-60"
            >
              {nowPlayingLoading ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          {nowPlayingLoading && !nowPlaying ? (
            <p className="text-sm text-pf-text-secondary">Checking Spotify...</p>
          ) : nowPlaying ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {nowPlaying.image ? (
                  <img
                    src={nowPlaying.image}
                    alt=""
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <p
                    className="flex h-14 w-14 items-center justify-center rounded-lg bg-pf-bg text-pf-spotify"
                    aria-hidden="true"
                  >
                    ♪
                  </p>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-pf-text">
                    {nowPlaying.name}
                  </p>
                  {nowPlaying.artist && (
                    <p className="truncate text-sm text-pf-text-secondary">
                      {nowPlaying.artist}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddNowPlaying}
                  className="rounded-lg border border-pf-border-active bg-pf-hover px-3 py-1.5 text-sm text-pf-text hover:opacity-90"
                >
                  Add to entry
                </button>
                {nowPlaying.url && (
                  <a
                    href={nowPlaying.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-pf-spotify bg-[#0d3a1a] px-3 py-1.5 text-sm text-pf-spotify hover:opacity-90"
                  >
                    Open in Spotify
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-pf-border bg-pf-bg px-3 py-4 text-center sm:text-left">
              <p className="text-sm text-pf-text-secondary">
                {nowPlayingMessage || "Nothing playing right now"}
              </p>
              <p className="mt-1 text-xs text-pf-inactive">
                Start a track in Spotify, then hit Refresh.
              </p>
            </div>
          )}
        </section>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-pf-danger/40 bg-pf-card px-3 py-2 text-sm text-pf-danger">
          {error}
        </p>
      )}
      {savedMessage && (
        <p className="mb-4 rounded-lg border border-pf-positive/40 bg-pf-card px-3 py-2 text-sm text-pf-positive">
          {savedMessage}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm text-pf-text-secondary">
            How are you feeling?
          </legend>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {MOODS.map((item) => {
              const selected = mood === item.name;
              return (
                <li key={item.name}>
                  <button
                    type="button"
                    onClick={() => setMood(item.name)}
                    className={`w-full rounded-xl border px-3 py-3 text-center transition sm:py-4 ${
                      selected
                        ? "border-pf-border-active bg-pf-hover text-pf-text"
                        : "border-pf-border bg-pf-card text-pf-text-secondary hover:bg-pf-hover"
                    }`}
                    aria-pressed={selected}
                  >
                    <span className="block text-2xl" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span className="mt-2 block text-sm font-medium">
                      {item.name}
                    </span>
                    <span
                      className={`mx-auto mt-2 block h-1.5 w-8 rounded-full ${item.color}`}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <article className="rounded-xl border border-pf-border bg-pf-card p-4 sm:p-5">
          <label
            htmlFor="journal-note"
            className="mb-2 block text-sm font-medium text-pf-text"
          >
            What contributed to this mood?
          </label>
          <textarea
            id="journal-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="Write a few lines..."
            className="w-full resize-y rounded-lg border border-pf-border bg-pf-bg px-3 py-2 text-sm text-pf-text outline-none placeholder:text-pf-inactive focus:border-pf-border-active"
          />

          {track ? (
            <aside className="mt-3 flex items-center gap-3 rounded-lg border border-pf-border bg-pf-bg px-3 py-2">
              {track.image ? (
                <img
                  src={track.image}
                  alt=""
                  className="h-10 w-10 rounded-md object-cover"
                />
              ) : (
                <p
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-pf-hover text-pf-accent"
                  aria-hidden="true"
                >
                  ♪
                </p>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-pf-inactive">Song on this entry</p>
                <p className="truncate text-sm text-pf-text">
                  {track.name}
                  {track.artist ? ` — ${track.artist}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveTrack}
                className="shrink-0 text-xs text-pf-text-secondary hover:text-pf-text"
              >
                Remove
              </button>
            </aside>
          ) : (
            <p className="mt-3 text-xs text-pf-inactive">
              No song attached.{" "}
              <Link to="/search" className="text-pf-accent hover:underline">
                Find one in Search
              </Link>
            </p>
          )}

          <fieldset className="mt-4">
            <legend className="sr-only">Tags</legend>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <ul className="flex flex-wrap gap-2">
                {TAGS.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <li key={tag}>
                      <button
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`rounded-lg border px-2.5 py-1 text-xs ${
                          selected
                            ? "border-pf-border-active bg-pf-hover text-pf-text"
                            : "border-pf-border text-pf-text-secondary hover:bg-pf-hover"
                        }`}
                        aria-pressed={selected}
                      >
                        {tag}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg border border-pf-border-active bg-pf-hover px-4 py-2.5 text-sm font-medium text-pf-text hover:opacity-90 disabled:opacity-60 sm:w-auto sm:py-2"
              >
                {saving ? "Saving..." : "Save entry"}
              </button>
            </div>
          </fieldset>
        </article>
      </form>

      {!loading && entries.length === 0 && (
        <section className="mt-8 sm:mt-10" aria-labelledby="today-empty-heading">
          <div className="rounded-xl border border-dashed border-pf-border bg-pf-card px-6 py-10 text-center">
            <h2
              id="today-empty-heading"
              className="text-lg font-semibold text-pf-text"
            >
              No entries yet today
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-pf-text-secondary leading-relaxed">
              Pick a mood, write a short note, and hit Save entry. Your log for
              today will show up here.
            </p>
          </div>
        </section>
      )}

      {!loading && entries.length > 0 && (
        <section className="mt-8 sm:mt-10" aria-labelledby="today-entries-heading">
          <h2
            id="today-entries-heading"
            className="mb-3 text-sm text-pf-text-secondary"
          >
            Today&apos;s entries
          </h2>
          <ul className="space-y-3">
            {entries.map((entry) => {
              const moodMeta = getMoodMeta(entry.mood);
              const moodBorder = moodMeta.color.replace("bg-", "border-l-");

              return (
                <li key={entry.id}>
                  <article
                    className={`rounded-xl border border-pf-border border-l-4 bg-pf-card p-4 ${moodBorder}`}
                  >
                    <header className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <p
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pf-bg text-lg"
                          aria-hidden="true"
                        >
                          {moodMeta.emoji}
                        </p>
                        <div className="min-w-0">
                          <h3 className="font-medium text-pf-text">
                            {entry.mood}
                          </h3>
                          <time
                            className="text-xs text-pf-inactive"
                            dateTime={entry.createdAt}
                          >
                            {new Date(entry.createdAt).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </time>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        className="shrink-0 rounded-lg border border-pf-border px-2.5 py-1 text-xs text-pf-text-secondary hover:border-pf-danger hover:text-pf-danger disabled:opacity-60"
                      >
                        {deletingId === entry.id ? "Deleting..." : "Delete"}
                      </button>
                    </header>

                    {entry.note && (
                      <p className="text-base text-pf-text leading-relaxed">
                        {entry.note}
                      </p>
                    )}

                    {entry.track?.name && (
                      <aside className="mt-3 flex flex-col gap-2 rounded-lg border border-pf-border bg-pf-bg px-3 py-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {entry.track.image ? (
                            <img
                              src={entry.track.image}
                              alt=""
                              className="h-11 w-11 rounded-md object-cover"
                            />
                          ) : (
                            <p
                              className="flex h-11 w-11 items-center justify-center rounded-md bg-pf-hover text-pf-spotify"
                              aria-hidden="true"
                            >
                              ♪
                            </p>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-pf-text">
                              {entry.track.name}
                            </p>
                            {entry.track.artist && (
                              <p className="truncate text-xs text-pf-text-secondary">
                                {entry.track.artist}
                              </p>
                            )}
                          </div>
                        </div>
                        {entry.track.url && (
                          <a
                            href={entry.track.url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-fit shrink-0 rounded-lg border border-pf-spotify bg-[#0d3a1a] px-2.5 py-1 text-xs text-pf-spotify hover:opacity-90"
                          >
                            Spotify
                          </a>
                        )}
                      </aside>
                    )}

                    {entry.tags?.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {entry.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-lg border border-pf-border bg-pf-bg px-2.5 py-1 text-xs text-pf-text-secondary"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </section>
  );
}

export default Today;
