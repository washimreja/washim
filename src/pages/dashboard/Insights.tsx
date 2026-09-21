import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  CloudRain,
  Footprints,
  Lightbulb,
  Sparkles,
  ThermometerSun,
  TrendingUp,
  TriangleAlert,
  Waves,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useWeather } from "@/hooks/useWeather";
import { useAuth } from "@/context/AuthContext";
import { generateInsights, rankActivities, windowHours } from "@/lib/personalize";
import { formatTempFull } from "@/lib/format";
import type { Insight } from "@/lib/types";
import { cn } from "@/lib/utils";

const INSIGHT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ThermometerSun,
  ThermometerSnowflake: ThermometerSun,
  CloudRain,
  Waves,
  Wind,
  Sparkles,
};

const KIND_ICONS: Record<Insight["kind"], React.ComponentType<{ className?: string }>> = {
  tip: Lightbulb,
  warning: TriangleAlert,
  pattern: TrendingUp,
};

const KIND_STYLES: Record<Insight["kind"], string> = {
  tip: "border-sky-400/30 bg-sky-500/10",
  warning: "border-amber-400/30 bg-amber-500/10",
  pattern: "border-violet-400/30 bg-violet-500/10",
};

export default function Insights() {
  const { user } = useAuth();
  const { data, loading } = useWeather(user?.homePlace ?? null);

  const insights = useMemo(() => (data && user ? generateInsights(data, user) : []), [data, user]);
  const todayWindow = useMemo(() => (data ? windowHours(data, 0, 12) : []), [data]);
  const ranked = useMemo(() => (data ? rankActivities(todayWindow, user) : []), [data, user, todayWindow]);
  const tomorrowWindow = useMemo(() => (data ? windowHours(data, 1, 12) : []), [data]);
  const rankedTomorrow = useMemo(() => (data ? rankActivities(tomorrowWindow, user) : []), [data, user, tomorrowWindow]);

  if (!user?.homePlace) {
    return (
      <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 text-amber-100">
        <p className="font-semibold">Set your home location first</p>
        <p className="mt-1 text-sm opacity-80">
          The personalization engine scores conditions against your comfort profile once it knows where you are.{" "}
          <Link to="/dashboard" className="underline">
            Set it on the Overview tab →
          </Link>
        </p>
      </div>
    );
  }

  const bandStyle: Record<string, string> = {
    great: "bg-emerald-500/15 text-emerald-300",
    good: "bg-sky-500/15 text-sky-300",
    fair: "bg-amber-500/15 text-amber-300",
    poor: "bg-white/10 text-white/50",
  };

  const top = ranked[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">AI Insights</h1>
          <p className="text-sm text-white/50">
            Explainable recommendations from your comfort profile · {user.homePlace.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" className="border border-sky-400/30 bg-sky-500/10 px-3 py-1.5">
            <Brain className="h-3.5 w-3.5" /> comfort-blend v2 · on-device
          </Badge>
          <Button variant="outline-light" size="sm" asChild>
            <Link to="/dashboard/settings">Tune preferences</Link>
          </Button>
        </div>
      </div>

      {/* hero recommendation */}
      {loading || !data ? (
        <Skeleton className="h-40 w-full bg-white/10" />
      ) : (
        top && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-sky-400/30 bg-gradient-to-br from-sky-500/15 via-night-850 to-indigo-500/10 p-6 md:p-8"
          >
            <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="relative flex flex-wrap items-center gap-6">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-200">
                <Footprints className="h-8 w-8" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Best move right now</p>
                <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">{top.activity.label}</h2>
                <p className="mt-1 text-sm text-white/60">
                  {top.reasons[0] ?? "Conditions match your profile"} · feels like{" "}
                  {formatTempFull(data.current.apparentTemperature, "c")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-6xl font-extrabold text-gradient-dark">{top.score}</p>
                <p className={cn("mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase", bandStyle[top.band])}>
                  {top.band}
                </p>
              </div>
            </div>
          </motion.div>
        )
      )}

      {/* generated insights */}
      <section>
        <h2 className="mb-3 px-1 font-display text-sm font-bold uppercase tracking-widest text-white/40">
          What SkySense noticed
        </h2>
        {insights.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/55">
            No notable patterns in the next 48 hours — conditions sit comfortably inside your profile. 🎯
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {insights.map((ins, i) => {
              const Icon = INSIGHT_ICONS[ins.icon] ?? KIND_ICONS[ins.kind];
              return (
                <motion.div
                  key={ins.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className={cn("rounded-2xl border p-5", KIND_STYLES[ins.kind])}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    <p className="font-semibold">{ins.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed opacity-80">{ins.body}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* activity scores */}
      <section>
        <h2 className="mb-3 px-1 font-display text-sm font-bold uppercase tracking-widest text-white/40">
          Activity scores · today vs tomorrow
        </h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <ScoreList title="Today" ranked={ranked} />
          <ScoreList title="Tomorrow" ranked={rankedTomorrow} />
        </div>
      </section>

      <p className="pb-2 text-center text-xs text-white/30">
        Scores blend live conditions with your interests — every reason is shown, nothing is a black box.
      </p>
    </div>
  );
}

function ScoreList({
  title,
  ranked,
}: {
  title: string;
  ranked: ReturnType<typeof rankActivities>;
}) {
  if (!ranked.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 px-1 text-sm font-semibold text-white/70">{title}</p>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-white/10" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 px-1 text-sm font-semibold text-white/70">{title}</p>
      <div className="space-y-1.5">
        {ranked.map((r) => (
          <div key={r.activity.id} className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-white/5">
            <span className="w-28 shrink-0 truncate text-sm font-medium">{r.activity.label}</span>
            <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full",
                  r.band === "great"
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
                    : r.band === "good"
                      ? "bg-gradient-to-r from-sky-400 to-sky-300"
                      : r.band === "fair"
                        ? "bg-gradient-to-r from-amber-400 to-amber-300"
                        : "bg-white/20"
                )}
                style={{ width: `${r.score}%` }}
              />
            </div>
            <span className="w-7 shrink-0 text-right text-sm font-bold tabular-nums">{r.score}</span>
            {r.reasons[0] && (
              <span className="hidden w-56 shrink-0 truncate text-xs text-white/40 lg:block">{r.reasons[0]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
