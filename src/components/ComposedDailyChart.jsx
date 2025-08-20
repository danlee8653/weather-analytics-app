import React from "react";
import { AreaChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatTemp } from "../lib/format";

export default function ComposedDailyChart({ data, unit }) {
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
