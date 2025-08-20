import React from "react";
import { Cloud, Sun, Moon } from "lucide-react";

export default function TopBar({ theme, setTheme, unit, setUnit }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Cloud className="w-7 h-7" aria-hidden />
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Weather Analytics
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
