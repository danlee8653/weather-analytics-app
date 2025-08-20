import React from "react";
import { MapPin, Search } from "lucide-react";
import { geocode } from "../lib/api";

export default function SearchBox({ onSelect }) {
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [error, setError] = React.useState("");

  async function runSearch() {
    setLoading(true);
    setError("");
    try {
      const r = await geocode(q.trim());
      setResults(r);
    } catch {
      setError("Couldn't search right now.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    const id = setTimeout(() => runSearch(), 350);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="w-full">
      <label htmlFor="city" className="sr-only">Search city</label>
      <div className="relative">
        <input
          id="city"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search city, state, or country..."
          className="w-full rounded-2xl border px-4 py-3 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-autocomplete="list"
          aria-controls="search-results"
        />
        <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      <div role="status" aria-live="polite" className="text-sm mt-1 h-5">
        {loading ? "Searching..." : error}
      </div>
      {results.length > 0 && (
        <ul
          id="search-results"
          className="mt-2 max-h-72 overflow-auto rounded-2xl border shadow-sm bg-white dark:bg-slate-900"
        >
          {results.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => onSelect(r)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span>
                  {r.name}{r.admin1 ? `, ${r.admin1}` : ""} – {r.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
