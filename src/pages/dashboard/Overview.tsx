import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Navigation,
  Plus,
  RefreshCw,
  Star,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import WeatherIcon from "@/components/WeatherIcon";
import LocationSearch from "@/components/LocationSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWeather } from "@/hooks/useWeather";
import { useAuth } from "@/context/AuthContext";
import { deriveAlerts } from "@/lib/alerts";
import { describeWeather } from "@/lib/weather";
import { formatClock, formatDay, formatTemp, formatTempFull, formatWind, comfortLabel, relativeTime } from "@/lib/format";
import { placeLabel } from "@/lib/store";
import type { GeoPlace, WeatherData, WeatherAlert } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Overview() {
  const { user, updateProfile } = useAuth();
  const [place, setPlace] = useState(user?.homePlace ?? null);
  const { data, loading, error, refresh } = useWeather(place);

  // keep local state in sync when profile changes externally
  useEffect(() => {
    if (user?.homePlace) setPlace(user.homePlace);
  }, [user?.homePlace]);

  function chooseHome(p: GeoPlace) {
    setPlace(p);
    updateProfile((prev) => ({ ...prev, homePlace: p }));
  }

  const alerts = useMemo(() => (data ? deriveAlerts(data) : []), [data]);

  const nextHours = useMemo(() => {
    if (!data) return [];
    const cutoff = Date.now() - 3600_000;
    return data.hourly.filter((h) => new Date(h.time).getTime() >= cutoff).slice(0, 12);
  }, [data]);

  const favWeathers = useFavoriteWeathers(user?.favorites ?? []);

  const severityStyle: Record<WeatherAlert["severity"], string> = {
    severe: "border-red-400/30 bg-red-500/10 text-red-200",
    moderate: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    info: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  };

  return (
    <div className="space-y-6">
      {/* header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Overview</h1>
          <p className="text-sm text-white/50">
            {data ? `Live conditions for ${data.place.name} · updated ${relativeTime(data.fetchedAt)}` : "Loading your sky…"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-64">
            <LocationSearch onSelect={chooseHome} placeholder="Change location…" allowLocate />
          </div>
          <Button variant="outline-light" size="icon" onClick={refresh} title="Refresh">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error} — <button type="button" onClick={refresh} className="underline">retry</button>
        </div>
      )}

      {/* current + alerts grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* current card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-night-800/80 to-night-900/90 p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl" />
          {loading || !data ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 bg-white/10" />
              <Skeleton className="h-24 w-64 bg-white/10" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 text-sky-400" />
                <span className="truncate">{placeLabel(data.place)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <WeatherIcon code={data.current.weatherCode} isDay={data.current.isDay} className="h-20 w-20" />
                  <div>
                    <p className="font-display text-6xl font-extrabold tracking-tighter">{formatTemp(data.current.temperature, "c")}</p>
                    <p className="text-sm font-medium text-white/80">{describeWeather(data.current.weatherCode, data.current.isDay).label}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  <Metric icon={ThermometerFeel} label="Feels like" value={formatTempFull(data.current.apparentTemperature, "c")} />
                  <Metric icon={Droplets} label="Humidity" value={`${Math.round(data.current.humidity)}%`} />
                  <Metric icon={Wind} label="Wind" value={formatWind(data.current.windSpeed, "c")} />
                  <Metric icon={Gauge} label="Pressure" value={`${Math.round(data.current.pressure)} hPa`} />
                  <Metric icon={Eye} label="Visibility" value={`${(data.current.visibility / 1000).toFixed(1)} km`} />
                  <Metric icon={Sun} label="UV" value={`${data.current.uvIndex.toFixed(0)} · ${comfortLabel(data.current.uvIndex)}`} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* alerts column */}
        <div className="space-y-3">
          <h2 className="px-1 font-display text-sm font-bold uppercase tracking-widest text-white/40">Smart alerts</h2>
          {alerts.length === 0 && !loading && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/55">
              All clear — nothing in the next 7 days crosses your thresholds. 🌤️
            </div>
          )}
          {alerts.map((a) => (
            <div key={a.id} className={cn("rounded-2xl border p-4", severityStyle[a.severity])}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{a.title}</p>
                <Badge variant={a.severity === "severe" ? "destructive" : a.severity === "moderate" ? "warning" : "success"}>
                  {a.severity}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed opacity-80">{a.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* hourly */}
      <section>
        <h2 className="mb-3 px-1 font-display text-sm font-bold uppercase tracking-widest text-white/40">Next 12 hours</h2>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          {loading || !data
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 w-16 shrink-0 bg-white/10" />)
            : nextHours.map((h, i) => (
                <div
                  key={h.time}
                  className={cn(
                    "flex min-w-16 flex-col items-center gap-2 rounded-2xl px-2.5 py-3 transition-colors",
                    i === 0 ? "bg-sky-500/15 ring-1 ring-sky-400/40" : "hover:bg-white/5"
                  )}
                >
                  <span className="text-xs font-medium text-white/55">{i === 0 ? "Now" : formatClock(h.time)}</span>
                  <WeatherIcon code={h.weatherCode} isDay={h.isDay} className="h-8 w-8" animate={false} />
                  <span className="font-display text-sm font-bold">{formatTemp(h.temperature, "c")}</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-sky-300">
                    <Droplets className="h-2.5 w-2.5" /> {h.precipitationProbability}%
                  </span>
                </div>
              ))}
        </div>
      </section>

      {/* 7-day */}
      <section>
        <h2 className="mb-3 px-1 font-display text-sm font-bold uppercase tracking-widest text-white/40">7-day forecast</h2>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          {loading || !data ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-white/10" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.daily.map((d, i) => {
                const min = Math.min(...data.daily.map((x) => x.tempMin));
                const max = Math.max(...data.daily.map((x) => x.tempMax));
                const range = Math.max(max - min, 1);
                return (
                  <div key={d.date} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:px-6">
                    <span className="w-16 shrink-0 font-semibold">
                      {i === 0 ? "Today" : formatDay(d.date)}
                    </span>
                    <WeatherIcon code={d.weatherCode} className="h-8 w-8 shrink-0" animate={false} />
                    <div className="hidden w-28 shrink-0 sm:block">
                      <p className="truncate text-xs text-white/55">{describeWeather(d.weatherCode).short}</p>
                    </div>
                    <span className="hidden items-center gap-0.5 text-xs text-sky-300 sm:flex">
                      <Droplets className="h-3 w-3" /> {d.precipitationProbability}%
                    </span>
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
                      <span className="text-xs text-white/45">{formatTemp(d.tempMin, "c")}</span>
                      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-white/10 sm:w-40">
                        <div
                          className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-300"
                          style={{
                            left: `${((d.tempMin - min) / range) * 100}%`,
                            width: `${Math.max(((d.tempMax - d.tempMin) / range) * 100, 6)}%`,
                          }}
                        />
                      </div>
                      <span className="w-9 text-right font-semibold">{formatTemp(d.tempMax, "c")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* favorites */}
      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-white/40">Favorite locations</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
              <Plus className="h-4 w-4 text-sky-400" /> Add favorite
            </p>
            <LocationSearch
              onSelect={(p) => {
                updateProfile((prev) => ({
                  ...prev,
                  favorites: [...prev.favorites.filter((f) => f.id !== p.id), p].slice(0, 8),
                }));
                toast.success(`${p.name} added to favorites`);
              }}
              placeholder="Search a city…"
            />
          </div>
          {favWeathers.map(({ place: fav, weather, loading: l }) => (
            <div key={fav.id} className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-sky-400/40">
              <button
                type="button"
                onClick={() => chooseHome(fav)}
                className="w-full text-left"
                title={`Set ${fav.name} as active`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{fav.name}</p>
                    <p className="truncate text-xs text-white/45">{fav.country}</p>
                  </div>
                  {weather ? (
                    <WeatherIcon code={weather.current.weatherCode} isDay={weather.current.isDay} className="h-9 w-9" animate={false} />
                  ) : (
                    <Skeleton className="h-9 w-9 bg-white/10" />
                  )}
                </div>
                {weather && !l ? (
                  <p className="mt-3 font-display text-2xl font-bold">{formatTemp(weather.current.temperature, "c")}</p>
                ) : (
                  <Skeleton className="mt-3 h-7 w-16 bg-white/10" />
                )}
              </button>
              <button
                type="button"
                title="Remove"
                onClick={() => {
                  updateProfile((prev) => ({ ...prev, favorites: prev.favorites.filter((f) => f.id !== fav.id) }));
                  toast(`${fav.name} removed`);
                }}
                className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white/60 hover:text-red-300 group-hover:flex"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {!user?.favorites.length && (
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/45">
              <Star className="mr-3 h-4 w-4 shrink-0 text-amber-300" />
              Favorites keep one-tap eyes on the places you care about.
            </div>
          )}
        </div>
      </section>

      {/* sunrise/sunset quick strip */}
      {data && (
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <Sunrise className="h-8 w-8 text-amber-300" />
            <div>
              <p className="text-xs uppercase tracking-wide text-white/45">Sunrise</p>
              <p className="font-display text-lg font-bold">{data.daily[0]?.sunrise ? formatClock(data.daily[0].sunrise) : "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <Sunset className="h-8 w-8 text-orange-300" />
            <div>
              <p className="text-xs uppercase tracking-wide text-white/45">Sunset</p>
              <p className="font-display text-lg font-bold">{data.daily[0]?.sunset ? formatClock(data.daily[0].sunset) : "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <Navigation className="h-8 w-8 text-sky-300" />
            <div>
              <p className="text-xs uppercase tracking-wide text-white/45">Feels like now</p>
              <p className="font-display text-lg font-bold">{formatTempFull(data.current.apparentTemperature, "c")}</p>
            </div>
          </div>
        </section>
      )}

      <p className="pt-2 text-center text-xs text-white/30">
        Need the assistant's take? <Link to="/dashboard/insights" className="text-sky-300 hover:text-sky-200">Open AI Insights →</Link>
      </p>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-sky-300" />
      <div>
        <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ThermometerFeel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  );
}
/** Load light weather info for favorite places (individually cached by useWeather). */
function useFavoriteWeathers(favorites: GeoPlace[]) {
  const [entries, setEntries] = useState<Array<{ place: GeoPlace; weather: WeatherData | null; loading: boolean }>>(
    favorites.map((f) => ({ place: f, weather: null, loading: true }))
  );

  useEffect(() => {
    let cancelled = false;
    setEntries(favorites.map((f) => ({ place: f, weather: null, loading: true })));
    Promise.all(
      favorites.map(async (f) => {
        try {
          const w = await fetchWeatherFor(f);
          return { place: f, weather: w, loading: false };
        } catch {
          return { place: f, weather: null, loading: false };
        }
      })
    ).then((res) => {
      if (!cancelled) setEntries(res);
    });
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(favorites.map((f) => f.id))]); // eslint-disable-line react-hooks/exhaustive-deps

  return entries;
}

async function fetchWeatherFor(place: GeoPlace): Promise<WeatherData> {
  const mod = await import("@/lib/weather");
  return mod.fetchWeather(place);
}
