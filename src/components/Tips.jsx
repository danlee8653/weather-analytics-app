import React from "react";

export default function Tips() {
  return (
    <ul className="list-disc list-inside text-sm space-y-1 text-slate-600 dark:text-slate-400">
      <li>Toggle °C/°F and km/h or mph with the Units button.</li>
      <li>Add a city to Favorites to pin it for later.</li>
      <li>Charts show hourly trends; hover or tap for exact values.</li>
      <li>7‑day outlook summarizes highs/lows, rain risk, and UV.</li>
    </ul>
  );
}
