import { useState, useEffect } from "react";

export const LS_KEYS = {
  FAVORITES: "wa:favorites",
  RECENTS: "wa:recents",
  THEME: "wa:theme",
  UNIT: "wa:unit",
};

export function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
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

export function formatTemp(v, unit) {
  if (v == null) return "–";
  return `${Math.round(v)}°${unit === "imperial" ? "F" : "C"}`;
}

export function formatSpeed(v, unit) {
  if (v == null) return "–";
  return `${Math.round(v)} ${unit === "imperial" ? "mph" : "km/h"}`;
}

export function formatDistance(v, unit) {
  if (v == null) return "–";
  return `${Math.round(v)} ${unit === "imperial" ? "mi" : "km"}`;
}

export function toLocalIso(ts, tz) {
  try {
    return new Date(ts + (tz ? " " + tz : "")).toISOString();
  } catch {
    return new Date(ts).toISOString();
  }
}
