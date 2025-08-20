import React from "react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar
} from "recharts";
import StatCard from "./StatCard";
import { Thermometer, Droplets, Wind, Gauge } from "lucide-react";
import { formatTemp, formatSpeed, formatDistance } from "../lib/format";

export default function Overview({ hourly, unit, current, maxRainProb, avgWind }) {
  if (!hourly?.length || !current) return null;

  return (
    <>
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
    </>
  );
}
