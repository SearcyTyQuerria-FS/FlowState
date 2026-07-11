import { useState } from "react";
import brentArtistImg from "../assets/brent-faiyaz-artist.jpg";
import brentAlbumImg from "../assets/brent-faiyaz-album.jpg";
import brentTrackImg from "../assets/brent-faiyaz-track.jpg";

const FAKE_RESULTS = [
  {
    id: "1",
    type: "Artist",
    title: "Brent Faiyaz",
    subtitle: "Artist",
    url: "https://open.spotify.com/artist/3tlXnStJ1fFhdScmQeLpuG",
    image: brentArtistImg,
  },
  {
    id: "2",
    type: "Album",
    title: "Icon",
    subtitle: "Album · Brent Faiyaz",
    url: "https://open.spotify.com/album/7oBZ821DTjUc2Ky2fV6l6Q",
    image: brentAlbumImg,
  },
  {
    id: "3",
    type: "Song",
    title: "have to.",
    subtitle: "Song · Brent Faiyaz",
    url: "https://open.spotify.com/track/7GApeoo08HHJ70980XyPZz",
    image: brentTrackImg,
  },
];

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  function handleSearch(event) {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(true);
      return;
    }

    // temporary fake results until I hook up Spotify
    setResults(FAKE_RESULTS);
    setHasSearched(true);
  }

  return (
    <section aria-labelledby="search-heading">
      <header className="mb-6">
        <h1 id="search-heading" className="text-3xl font-bold text-pf-text">
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
        <div className="flex items-center gap-3 rounded-xl border border-pf-border bg-pf-card px-4 py-3">
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for artist, album, or song..."
            className="w-full bg-transparent text-pf-text outline-none placeholder:text-pf-inactive"
          />
          <button
            type="submit"
            className="rounded-lg border border-pf-border-active bg-pf-hover px-3 py-1.5 text-sm font-medium text-pf-text hover:opacity-90"
          >
            Search
          </button>
        </div>
      </form>

      {!hasSearched || results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-pf-border bg-pf-card px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-pf-text">No Results</h2>
          <p className="mt-2 text-sm text-pf-text-secondary">
            {hasSearched
              ? "Try a different search term."
              : "Type a search query to get started."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {results.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-pf-border bg-pf-card p-4"
            >
              <img
                src={item.image}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-pf-text">
                  {item.title}
                </p>
                <p className="truncate text-sm text-pf-text-secondary">
                  {item.subtitle}
                </p>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-pf-spotify bg-[#0d3a1a] px-3 py-1.5 text-sm text-pf-spotify hover:opacity-90"
              >
                Open in Spotify
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Search;
