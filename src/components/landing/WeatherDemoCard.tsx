import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CloudRain, Droplets, RefreshCw, Wind } from "lucide-react";
import WeatherIcon from "@/components/WeatherIcon";
import LocationSearch from "@/components/LocationSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeather } from "@/hooks/useWeather";
import { describeWeather } from "@/lib/weather";
import { formatHour, formatTemp, formatTempFull, formatWind } from "@/lib/format";
import type { GeoPlace } from "@/lib/types";
import { cn } from "@/lib/utils";

const CITIES: GeoPlace[] = [
  { id: 5391959, name: "San Francisco", admin1: "California", country: "United States", countryCode: "US", latitude: 37.7749, longitude: -122.4194, timezone: "America/Los_Angeles" },
  { id: 5128581, name: "New York", admin1: "New York", country: "United States", countryCode: "US", latitude: 40.7143, longitude: -74.006, timezone: "America/New_York" },
  { id: 2643743, name: "London", country: "United Kingdom", countryCode: "GB", latitude: 51.5085, longitude: -0.1257, timezone: "Europe/London" },
  { id: 1850147, name: "Tokyo", country: "Japan", countryCode: "JP", latitude: 35.6895, longitude: 139.6917, timezone: "Asia/Tokyo" },
  { id: 2147714, name: "Sydney", admin1: "New South Wales", country: "Australia", countryCode: "AU", latitude: -33.8679, longitude: 151.2073, timezone: "Australia/Sydney" },
  { id: 292223, name: "Dubai", country: "United Arab Emirates", countryCode: "AE", latitude: 25.0657, longitude: 55.1713, timezone: "Asia/Dubai" },
];

export default function WeatherDemoCard() {
  const [place, setPlace] = useState<GeoPlace>(CITIES[0]);
  const { data, loading, error, refresh } = useWeather(place);

  const nextHours = useMemo(() => {
    if (!data) return [];
    const now = Date.now() - 3600_000;
    return data.hourly.filter((h) => new Date(h.time).getTime() >= now).slice(0, 6);
  }, [data]);

  const today = data?.daily[0];
  const desc = data ? describeWeather(data.current.weatherCode, data.current.isDay) : null;

  return (
    <div className="relative">
      {/* floating accent cards */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-6 -top-6 z-20 hidden items-center gap-3 rounded-2xl border border-white/10 bg-night-850/90 p-3.5 shadow-xl backdrop-blur-xl md:flex"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20">
          <CloudRain className="h-5 w-5 text-amber-300" />
        </span>
        <div>
          <p className="text-xs font-semibold text-white">Smart alert</p>
          <p className="text-[11px] text-white/55">Rain at 15:00 — run moved to 07:30</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute -bottom-6 -right-4 z-20 hidden items-center gap-3 rounded-2xl border border-white/10 bg-night-850/90 p-3.5 shadow-xl backdrop-blur-xl md:flex"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/20">
          <Wind className="h-5 w-5 text-sky-300" />
        </span>
        <div>
          <p className="text-xs font-semibold text-white">Best hiking window</p>
          <p className="text-[11px] text-white/55">Tomorrow · 06:00 – 10:00</p>
        </div>
      </motion.div>

      {/* main card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-night-800/90 to-night-900/95 shadow-2xl shadow-sky-950/50 backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* header row */}
        <div className="relative z-10 flex items-start justify-between gap-3 p-6 pb-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300/90">Live conditions</span>
            </div>
            <h3 className="mt-2 truncate font-display text-lg font-bold text-white">{place.name}</h3>
            <p className="truncate text-xs text-white/50">
              {[place.admin1, place.country].filter(Boolean).join(", ")}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            title="Refresh"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>

        {/* main reading */}
        <div className="relative z-10 flex items-center justify-between gap-4 p-6 pb-4">
          {error ? (
            <div className="w-full rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Couldn't load live weather right now. <button onClick={refresh} className="underline">Retry</button>
            </div>
          ) : loading || !data ? (
            <div className="flex w-full items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-16 w-36 bg-white/10" />
                <Skeleton className="h-4 w-44 bg-white/10" />
              </div>
              <Skeleton className="h-24 w-24 rounded-full bg-white/10" />
            </div>
          ) : (
            <>
              <div>
                <div className="font-display text-7xl font-extrabold tracking-tighter text-white">
                  {formatTemp(data.current.temperature, "c")}
                </div>
                <p className="mt-1 text-sm font-medium text-white/85">{desc?.label}</p>
                <p className="text-xs text-white/50">
                  Feels like {formatTempFull(data.current.apparentTemperature, "c")} · H {formatTemp(today?.tempMax ?? data.current.temperature, "c")} · L {formatTemp(today?.tempMin ?? data.current.temperature, "c")}
                </p>
              </div>
              <WeatherIcon code={data.current.weatherCode} isDay={data.current.isDay} className="h-24 w-24 shrink-0 drop-shadow-[0_0_24px_rgba(56,189,248,0.35)]" />
            </>
          )}
        </div>

        {/* hourly strip */}
        <div className="relative z-10 border-t border-white/10 px-6 py-4">
          {loading || !data ? (
            <div className="flex justify-between gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-12 bg-white/10" />
              ))}
            </div>
          ) : (
            <div className="flex justify-between gap-1 overflow-hidden">
              {nextHours.map((h) => (
                <div key={h.time} className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-medium text-white/50">{formatHour(h.time)}</span>
                  <WeatherIcon code={h.weatherCode} isDay={h.isDay} className="h-7 w-7" animate={false} />
                  <span className="text-xs font-semibold text-white">{formatTemp(h.temperature, "c")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* metric chips */}
        <div className="relative z-10 grid grid-cols-3 gap-2 px-6 pb-6">
          {data && (
            <>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3">
                <Droplets className="h-4 w-4 shrink-0 text-sky-300" />
                <div>
                  <p className="text-[11px] text-white/50">Humidity</p>
                  <p className="text-sm font-semibold text-white">{Math.round(data.current.humidity)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3">
                <Wind className="h-4 w-4 shrink-0 text-indigo-300" />
                <div>
                  <p className="text-[11px] text-white/50">Wind</p>
                  <p className="text-sm font-semibold text-white">{formatWind(data.current.windSpeed, "c")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3">
                <CloudRain className="h-4 w-4 shrink-0 text-blue-300" />
                <div>
                  <p className="text-[11px] text-white/50">Rain</p>
                  <p className="text-sm font-semibold text-white">{Math.round(nextHours[0]?.precipitationProbability ?? 0)}%</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* city chips + search */}
        <div className="relative z-10 space-y-3 border-t border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap gap-1.5">
            {CITIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPlace(c)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  place.id === c.id
                    ? "bg-sky-500 text-white shadow-glow-sm"
                    : "bg-white/5 text-white/60 hover:bg-white/15 hover:text-white"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <LocationSearch
            onSelect={setPlace}
            variant="dark"
            placeholder="Search 40,000+ cities…"
            allowLocate
          />
        </div>
      </div>
    </div>
  );
}
