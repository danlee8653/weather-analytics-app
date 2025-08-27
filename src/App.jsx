import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Cloud,
  MapPin,
  Search,
  Star,
  Trash2,
  Wind,
  Droplets,
  Thermometer,
  Sun,
  Moon,
  Gauge,
  Calendar,
} from "lucide-react";

const LS_KEYS = {
  FAVORITES: "wa:favorites",
  RECENTS: "wa:recents",
  THEME: "wa:theme",
  UNIT: "wa:unit",
};

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

function formatTemp(v, unit) {
  if (v == null) return "–";
  return `${Math.round(v)}°${unit === "imperial" ? "F" : "C"}`;
}

function formatSpeed(v, unit) {
  if (v == null) return "–";
  return `${Math.round(v)} ${unit === "imperial" ? "mph" : "km/h"}`;
}

function formatDistance(v, unit) {
  if (v == null) return "–";
  return `${Math.round(v)} ${unit === "imperial" ? "mi" : "km"}`;
}

function toLocalIso(ts, tz) {
  try {
    return new Date(ts + (tz ? " " + tz : "")).toISOString();
  } catch {
    return new Date(ts).toISOString();
  }
}

// Unit helpers for Open-Meteo
const unitParams = {
  metric: {
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  },
  imperial: {
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
  },
};

// ---- API --------------------------------------------------------------------
async function geocode(query) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return (data?.results || []).map((r) => ({
    id: `${r.latitude},${r.longitude}`,
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));
}

async function fetchForecast({ lat, lon, unit }) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "precipitation_probability",
      "precipitation",
      "dew_point_2m",
      "apparent_temperature",
      "visibility",
    ].join(",")
  );
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "precipitation_probability_max",
      "uv_index_max",
    ].join(",")
  );
  url.searchParams.set("timezone", "auto");
  const up = unitParams[unit || "metric"]; // default metric
  Object.entries(up).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Forecast failed");
  return await res.json();
}

// ---- Components -------------------------------------------------------------
function TopBar({ theme, setTheme, unit, setUnit }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Cloud className="w-7 h-7" aria-hidden />
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Weather Forecast
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setUnit((u) => (u === "metric" ? "imperial" : "metric"))}
          className="px-3 py-2 rounded-2xl shadow-sm border text-sm hover:shadow transition"
          aria-label="Toggle units"
        >
          {unit === "metric" ? "°C / km/h" : "°F / mph"}
        </button>
        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="px-3 py-2 rounded-2xl shadow-sm border text-sm hover:shadow transition flex items-center gap-2"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </div>
    </div>
  );
}

function SearchBox({ onSelect }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  async function runSearch() {
    setLoading(true);
    setError("");
    try {
      const r = await geocode(q.trim());
      setResults(r);
    } catch (e) {
      setError("Couldn't search right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    const id = setTimeout(() => runSearch(), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="w-full">
      <label htmlFor="city" className="sr-only">
        Search city
      </label>
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
                  {r.name}
                  {r.admin1 ? `, ${r.admin1}` : ""} – {r.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border shadow-sm p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl border">
          <Icon className="w-5 h-5" aria-hidden />
        </div>
        <div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
          {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
        </div>
      </div>
    </motion.div>
  );
}

function Section({ title, icon: Icon, right, children }) {
  return (
    <section className="rounded-2xl border shadow-sm p-4 md:p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5" aria-hidden />}
          <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

// ---- Main App ---------------------------------------------------------------
export default function WeatherAnalyticsApp() {
  const [theme, setTheme] = useLocalStorage(LS_KEYS.THEME, "light");
  const [unit, setUnit] = useLocalStorage(LS_KEYS.UNIT, "metric");
  const [favorites, setFavorites] = useLocalStorage(LS_KEYS.FAVORITES, []);
  const [recents, setRecents] = useLocalStorage(LS_KEYS.RECENTS, []);

  const [place, setPlace] = useState(null); // { name, country, latitude, longitude, timezone }
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // theme handling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  // Fetch when place or unit changes
  useEffect(() => {
    async function run() {
      if (!place) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetchForecast({
          lat: place.latitude,
          lon: place.longitude,
          unit,
        });
        setData(res);
        setRecents((r) => {
          const item = {
            id: `${place.latitude},${place.longitude}`,
            name: place.name,
            country: place.country,
            admin1: place.admin1,
            latitude: place.latitude,
            longitude: place.longitude,
            timezone: place.timezone,
            ts: Date.now(),
          };
          const deduped = [item, ...r.filter((x) => x.id !== item.id)];
          return deduped.slice(0, 8);
        });
      } catch (e) {
        console.error(e);
        setError("Couldn't load forecast. Try again.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [place, unit, setRecents]);

  const hourly = useMemo(() => {
    if (!data?.hourly) return [];
    const tz = data.timezone;
    return data.hourly.time.map((t, i) => ({
      time: new Date(t).toLocaleString([], { hour: "2-digit", minute: "2-digit" }),
      hour: new Date(t).getHours(),
      temp: data.hourly.temperature_2m?.[i],
      humidity: data.hourly.relative_humidity_2m?.[i],
      wind: data.hourly.wind_speed_10m?.[i],
      precipProb: data.hourly.precipitation_probability?.[i],
      precip: data.hourly.precipitation?.[i],
      dew: data.hourly.dew_point_2m?.[i],
      feels: data.hourly.apparent_temperature?.[i],
      visibility: data.hourly.visibility?.[i] != null ? data.hourly.visibility?.[i] / 1000 : null, // m->km
      iso: toLocalIso(t, tz),
    }));
  }, [data]);

  const daily = useMemo(() => {
    if (!data?.daily) return [];
    return data.daily.time.map((t, i) => ({
      date: new Date(t).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
      tmin: data.daily.temperature_2m_min?.[i],
      tmax: data.daily.temperature_2m_max?.[i],
      rainMax: data.daily.precipitation_probability_max?.[i],
      sunrise: data.daily.sunrise?.[i],
      sunset: data.daily.sunset?.[i],
      uv: data.daily.uv_index_max?.[i],
    }));
  }, [data]);

  const current = useMemo(() => {
    if (!hourly.length) return null;
    // pick nearest hour to now
    const now = Date.now();
    let best = hourly[0];
    let bestDiff = Math.abs(new Date(hourly[0].iso).getTime() - now);
    for (const h of hourly) {
      const d = Math.abs(new Date(h.iso).getTime() - now);
      if (d < bestDiff) {
        best = h;
        bestDiff = d;
      }
    }
    return best;
  }, [hourly]);

  const isFav = place && favorites.some((f) => f.id === `${place.latitude},${place.longitude}`);

  function toggleFavorite() {
    if (!place) return;
    const id = `${place.latitude},${place.longitude}`;
    setFavorites((fs) => {
      if (fs.some((f) => f.id === id)) return fs.filter((f) => f.id !== id);
      return [
        ...fs,
        {
          id,
          name: place.name,
          country: place.country,
          admin1: place.admin1,
          latitude: place.latitude,
          longitude: place.longitude,
          timezone: place.timezone,
        },
      ];
    });
  }

  // Derived summaries
  const avgWind = useMemo(() => {
    if (!hourly.length) return null;
    const v = hourly.reduce((a, b) => a + (b.wind || 0), 0) / hourly.length;
    return v;
  }, [hourly]);

  const maxRainProb = useMemo(() => Math.max(0, ...hourly.map((h) => h.precipProb ?? 0)), [hourly]);

  // ---- Render ----------------------------------------------------------------
  return (
    <div className={"min-h-screen " + (theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900")}
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <TopBar theme={theme} setTheme={setTheme} unit={unit} setUnit={setUnit} />

        <Section title="Find a city" icon={MapPin}>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SearchBox onSelect={setPlace} />
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Favorites</div>
                <div className="flex flex-wrap gap-2">
                  {favorites.length === 0 && (
                    <div className="text-sm text-slate-500">No favorites yet.</div>
                  )}
                  {favorites.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPlace(f)}
                      className="px-3 py-1.5 rounded-full border shadow-sm hover:shadow"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Recent</div>
                <div className="flex flex-wrap gap-2">
                  {recents.length === 0 && (
                    <div className="text-sm text-slate-500">Search for a city to get started.</div>
                  )}
                  {recents.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setPlace(r)}
                      className="px-3 py-1.5 rounded-full border shadow-sm hover:shadow"
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section
              title={place ? `${place.name}${place.admin1 ? ", " + place.admin1 : ""} – ${place.country}` : "Overview"}
              icon={Cloud}
              right={
                place && (
                  <button
                    onClick={toggleFavorite}
                    className={
                      "px-3 py-2 rounded-2xl border shadow-sm hover:shadow flex items-center gap-2 " +
                      (isFav ? "bg-yellow-50 dark:bg-yellow-900/20" : "")
                    }
                    aria-pressed={isFav}
                  >
                    <Star className={"w-4 h-4 " + (isFav ? "fill-yellow-400 stroke-yellow-400" : "")} />
                    <span>{isFav ? "Favorited" : "Add to favorites"}</span>
                  </button>
                )
              }
            >
              {loading && <div>Loading forecast…</div>}
              {error && <div className="text-red-600">{error}</div>}

              {!loading && !error && current && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard
                    icon={Thermometer}
                    label="Temperature"
                    value={formatTemp(current.temp, unit)}
                    sub={`Feels ${formatTemp(current.feels, unit)} • Dew ${formatTemp(current.dew, unit)}`}
                  />
                  <StatCard
                    icon={Droplets}
                    label="Humidity"
                    value={`${current.humidity ?? "–"}%`}
                    sub={`Rain chance up to ${maxRainProb}% today`}
                  />
                  <StatCard
                    icon={Wind}
                    label="Wind"
                    value={formatSpeed(current.wind, unit)}
                    sub={`Avg ${avgWind ? formatSpeed(avgWind, unit) : "–"}`}
                  />
                  <StatCard
                    icon={Gauge}
                    label="Visibility"
                    value={formatDistance(current.visibility, unit)}
                    sub="Estimated at 2m"
                  />
                </div>
              )}

              {hourly.length > 0 && (
                <div className="mt-6 grid lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourly} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                        <defs>
                          <linearGradient id="tFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                        <Tooltip formatter={(v, n) => (n === "temp" || n === "feels" || n === "dew" ? formatTemp(v, unit) : v)} />
                        <Legend />
                        <Area type="monotone" dataKey="temp" name="Temp" stroke="currentColor" fill="url(#tFill)" />
                        <Line type="monotone" dataKey="feels" name="Feels" stroke="currentColor" strokeDasharray="4 2" dot={false} />
                        <Line type="monotone" dataKey="dew" name="Dew" stroke="currentColor" strokeDasharray="2 2" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hourly} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip formatter={(v, n) => (n === "wind" ? formatSpeed(v, unit) : `${v}%`)} />
                        <Legend />
                        <Line type="monotone" dataKey="humidity" name="Humidity %" dot={false} />
                        <Line type="monotone" dataKey="wind" name="Wind" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-64 lg:col-span-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourly} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Legend />
                        <Bar dataKey="precipProb" name="Rain chance %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </Section>

            {daily.length > 0 && (
              <Section title="7-day outlook" icon={Calendar}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedDailyChart data={daily} unit={unit} />
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                  {daily.slice(0, 7).map((d, i) => (
                    <div key={i} className="rounded-xl border p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{d.date}</div>
                        <div className="text-slate-600 dark:text-slate-400">
                          Sunrise {new Date(d.sunrise).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Sunset {new Date(d.sunset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatTemp(d.tmax, unit)} / {formatTemp(d.tmin, unit)}</div>
                        <div className="text-slate-600 dark:text-slate-400">Rain {d.rainMax ?? "–"}% • UV {d.uv ?? "–"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-6">
            <Section title="Manage" icon={Gauge}>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setFavorites([]);
                    setRecents([]);
                  }}
                  className="px-3 py-2 rounded-2xl border shadow-sm hover:shadow flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear lists
                </button>
                {place && (
                  <a
                    className="px-3 py-2 rounded-2xl border shadow-sm hover:shadow"
                    href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
                    target="_blank" rel="noreferrer"
                  >
                    Open in Maps
                  </a>
                )}
              </div>
            </Section>

            {data && (
              <Section title="Raw snapshot" icon={Cloud}>
                <div className="text-xs max-h-80 overflow-auto rounded-xl bg-black/80 text-green-200 p-3 font-mono">
                  <pre>{JSON.stringify({ place, unit, current, daily: daily.slice(0, 3), sampleHours: hourly.slice(0, 6) }, null, 2)}</pre>
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composed daily chart extracted for readability
function ComposedDailyChart({ data, unit }) {
  // Render a combined min/max temperature bar area
  return (
    <AreaChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip
        formatter={(v, n) =>
          n?.toLowerCase().includes("t") ? formatTemp(v, unit) : v
        }
      />
      <Legend />
      <Area type="monotone" dataKey="tmax" name="Max" stroke="currentColor" fillOpacity={0.2} />
      <Area type="monotone" dataKey="tmin" name="Min" stroke="currentColor" fillOpacity={0.1} />
      <Line type="monotone" dataKey="rainMax" name="Rain %" dot={false} />
    </AreaChart>
  );
}
