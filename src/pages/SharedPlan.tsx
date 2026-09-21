import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, CloudSun, MapPin, Sparkles } from "lucide-react";
import WeatherIcon from "@/components/WeatherIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWeather } from "@/hooks/useWeather";
import { getPlan, activityLabel } from "@/lib/store";
import { describeWeather } from "@/lib/weather";
import { formatDay, formatHour, formatTemp, formatTempFull } from "@/lib/format";
import type { GeoPlace } from "@/lib/types";

export default function SharedPlan() {
  const { planId } = useParams();
  const plan = planId ? getPlan(planId) : null;

  const place: GeoPlace | null = useMemo(() => {
    if (!plan) return null;
    // Try to resolve coordinates from the user's stored places; fall back to home.
    try {
      const raw = localStorage.getItem("skysense.users.v1");
      if (raw) {
        const users = JSON.parse(raw) as Record<string, { profile: { homePlace: GeoPlace | null; favorites: GeoPlace[] } }>;
        for (const u of Object.values(users)) {
          const candidates = [u.profile.homePlace, ...u.profile.favorites].filter(Boolean) as GeoPlace[];
          const named = candidates.find((c) => c.name.toLowerCase() === plan.placeName.toLowerCase());
          if (named) return named;
        }
        const anyHome = Object.values(users).map((u) => u.profile.homePlace).find(Boolean);
        if (anyHome) return anyHome;
      }
    } catch {
      /* fall through */
    }
    return null;
  }, [plan]);

  const { data } = useWeather(place);

  if (!plan) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-night-900 px-6 text-center text-white">
        <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
          <CloudSun className="h-7 w-7 text-sky-400" />
        </span>
        <h1 className="font-display text-2xl font-bold">This plan link has expired</h1>
        <p className="mt-2 max-w-md text-sm text-white/55">
          The plan may have been deleted, or the link belongs to a different device. Plans are stored locally in
          this demo — create your own and share it in seconds.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth?mode=signup">
            <Sparkles className="h-4 w-4" /> Try SkySense free
          </Link>
        </Button>
      </div>
    );
  }

  const whenDay = formatDay(plan.when.slice(0, 10), "long");
  const whenHour = formatHour(plan.when);

  return (
    <div className="relative min-h-screen bg-night-900 px-6 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-1/2 h-[380px] w-[640px] -translate-x-1/2 rounded-full bg-sky-500/15 blur-[120px]" />
        <div className="absolute inset-0 dots-dark opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> SkySense
        </Link>

        <div className="overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-night-800/90 to-night-900/95 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <span className="flex items-center gap-2 font-display font-bold">
              <CloudSun className="h-5 w-5 text-sky-400" /> SkySense plan
            </span>
            <Badge variant="success">Live forecast</Badge>
          </div>

          <div className="p-6">
            <h1 className="font-display text-2xl font-bold">{plan.title}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/55">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {whenDay} · {whenHour}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {plan.placeName}
              </span>
              <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs text-sky-300">{activityLabel(plan.activity)}</span>
            </div>
            {plan.note && <p className="mt-3 text-sm text-white/65">{plan.note}</p>}

            {data ? (
              <>
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-4">
                    <WeatherIcon code={data.current.weatherCode} isDay={data.current.isDay} className="h-14 w-14" />
                    <div>
                      <p className="font-display text-3xl font-extrabold">{formatTemp(data.current.temperature, "c")}</p>
                      <p className="text-xs text-white/55">{describeWeather(data.current.weatherCode, data.current.isDay).label}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-white/55">
                      Feels like <span className="font-semibold text-white">{formatTempFull(data.current.apparentTemperature, "c")}</span>
                    </p>
                    <p className="text-white/55">
                      H {formatTemp(data.daily[0]?.tempMax ?? data.current.temperature, "c")} · L{" "}
                      {formatTemp(data.daily[0]?.tempMin ?? data.current.temperature, "c")}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs text-white/40">
                  Live conditions near {plan.placeName} · refreshed via Open-Meteo
                </p>
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/50">
                Forecast preview isn't available in this browser (plan locations are device-local in this demo),
                but the full card renders for anyone who created it here.
              </div>
            )}

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <p className="text-sm text-white/55">Planning something too?</p>
              <Button asChild className="mt-3">
                <Link to="/auth?mode=signup">
                  <Sparkles className="h-4 w-4" /> Build your own weather plan
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Shared via SkySense — weather that thinks ahead.
        </p>
      </div>
    </div>
  );
}
