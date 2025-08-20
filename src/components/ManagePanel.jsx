import React from "react";
import { Trash2 } from "lucide-react";

export default function ManagePanel({ setFavorites, setRecents, place }) {
  return (
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
  );
}
