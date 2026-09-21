import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  Clock,
  ExternalLink,
  Facebook,
  Link2,
  Mail,
  MapPin,
  Share2,
  Sparkles,
  Trash2,
  Twitter,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeather } from "@/hooks/useWeather";
import { useAuth } from "@/context/AuthContext";
import { rankActivities, windowHours } from "@/lib/personalize";
import { ACTIVITIES } from "@/lib/personalize";
import {
  addPlan,
  activityLabel,
  listPlans,
  removePlan,
  setPlanShared,
} from "@/lib/store";
import { formatDay, formatHour } from "@/lib/format";
import type { Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BestSlot {
  time: string;
  score: number;
  label: string;
}

export default function Planner() {
  const { user } = useAuth();
  const { data, loading } = useWeather(user?.homePlace ?? null);

  const [plans, setPlans] = useState<Plan[]>(() => listPlans());
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState(() => {
    const t = new Date(Date.now() + 86400_000);
    t.setHours(9, 0, 0, 0);
    return toLocalInput(t);
  });
  const [placeName, setPlaceName] = useState("");
  const [activity, setActivity] = useState(ACTIVITIES[0].id);
  const [note, setNote] = useState("");



  const bestSlots: BestSlot[] = useMemo(() => {
    if (!data) return [];
    const hours = windowHours(data, 0, 14);
    const top = rankActivities(hours, user).slice(0, 3);
    return top.map((r) => {
      const best = [...hours]
        .map((h) => ({ h, s: r.activity.score({
          tempC: h.temperature,
          apparentC: h.apparentTemperature,
          precipitationProb: h.precipitationProbability,
          windMax: h.windSpeed,
          uvIndexMax: h.uvIndex,
          cloudCoverPct: h.cloudCover,
        }) }))
        .sort((a, b) => b.s - a.s)[0];
      return {
        time: best?.h.time ?? hours[0]?.time ?? new Date().toISOString(),
        score: r.score,
        label: r.activity.label,
      };
    });
  }, [data, user]);

  function createPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const plan: Plan = {
      id: `p_${Date.now().toString(36)}`,
      title: title.trim(),
      note: note.trim(),
      when: new Date(when).toISOString(),
      placeName: placeName.trim() || user?.homePlace?.name || "Home",
      activity,
      createdAt: Date.now(),
      shared: false,
    };
    setPlans(addPlan(plan));
    setTitle("");
    setNote("");
    toast.success("Plan saved — share it with the crew below.");
  }

  function copyLink(plan: Plan) {
    const url = `${window.location.origin}/plan/${plan.id}`;
    void navigator.clipboard?.writeText(url).then(
      () => toast.success("Public link copied to clipboard"),
      () => toast.error("Couldn't access the clipboard")
    );
  }

  function nativeShare(plan: Plan) {
    const url = `${window.location.origin}/plan/${plan.id}`;
    const text = `${plan.title} — ${formatDay(plan.when.slice(0, 10), "long")} via SkySense`;
    if (navigator.share) {
      void navigator.share({ title: plan.title, text, url }).catch(() => undefined);
    } else {
      copyLink(plan);
    }
  }
  void nativeShare;

  function shareTo(network: "x" | "whatsapp" | "facebook" | "email", plan: Plan) {
    const url = `${window.location.origin}/plan/${plan.id}`;
    const text = encodeURIComponent(`${plan.title} — weather looks good. Join me! ⛅ #SkySense`);
    const u = encodeURIComponent(url);
    const targets: Record<string, string> = {
      x: `https://twitter.com/intent/tweet?text=${text}&url=${u}`,
      whatsapp: `https://wa.me/?text=${text}%20${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      email: `mailto:?subject=${encodeURIComponent(plan.title)}&body=${text}%20${u}`,
    };
    window.open(targets[network], "_blank", "noopener,noreferrer");
  }

  const shareTargets = [
    { id: "x" as const, icon: Twitter, label: "X" },
    { id: "whatsapp" as const, icon: MessageCircleIcon, label: "WhatsApp" },
    { id: "facebook" as const, icon: Facebook, label: "Facebook" },
    { id: "email" as const, icon: Mail, label: "Email" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Planner & Sharing</h1>
        <p className="text-sm text-white/50">
          Schedule around the sky, then push the plan to your group in one tap.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* create form */}
        <form onSubmit={createPlan} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-display font-bold">
            <CalendarPlus className="h-4 w-4 text-sky-400" /> New plan
          </h2>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Sunrise run, market trip…"
                className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm outline-none transition-colors placeholder:text-white/35 focus:border-sky-400/70"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50">When</span>
                <input
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-sky-400/70"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50">Where</span>
                <input
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder={user?.homePlace?.name ?? "Home"}
                  className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm outline-none placeholder:text-white/35 focus:border-sky-400/70"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50">Activity</span>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/15 bg-night-800 px-4 text-sm outline-none focus:border-sky-400/70"
              >
                {ACTIVITIES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50">Note</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Who's coming, what to bring…"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-sky-400/70"
              />
            </label>

            <Button type="submit" className="w-full" disabled={!title.trim()}>
              <CalendarPlus className="h-4 w-4" /> Save plan
            </Button>
          </div>

          {/* best slots */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" /> Best windows today
            </p>
            <div className="mt-3 space-y-2">
              {loading || !data
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full bg-white/10" />)
                : bestSlots.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        const d = new Date(s.time);
                        d.setMinutes(0, 0, 0);
                        setWhen(toLocalInput(d));
                        toast(`${s.label} window set — ${formatHour(s.time)}`);
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-left text-sm transition-colors hover:border-sky-400/40 hover:bg-white/10"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-sky-300" />
                        {formatHour(s.time)} · {s.label}
                      </span>
                      <span className="font-bold text-emerald-300">{s.score}</span>
                    </button>
                  ))}
            </div>
          </div>
        </form>

        {/* plans list */}
        <div className="space-y-3 lg:col-span-3">
          {plans.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-white/45">
              <Users className="mx-auto mb-3 h-8 w-8 text-white/30" />
              No plans yet — create your first one on the left and it'll show up here with a share card.
            </div>
          )}
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{plan.title}</h3>
                    {plan.shared && <Badge variant="success">Shared</Badge>}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatDay(plan.when.slice(0, 10), "long")} · {formatHour(plan.when)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {plan.placeName}
                    </span>
                    <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-300">{activityLabel(plan.activity)}</span>
                  </p>
                  {plan.note && <p className="mt-2 text-sm text-white/60">{plan.note}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPlans(setPlanShared(plan.id, !plan.shared))}
                    title={plan.shared ? "Unshare" : "Make public"}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                      plan.shared ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-white/5 text-white/60 hover:bg-white/15"
                    )}
                  >
                    {plan.shared ? "Public" : "Private"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlans(removePlan(plan.id));
                      toast("Plan deleted");
                    }}
                    title="Delete plan"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-red-500/15 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-4">
                <span className="mr-1 flex items-center gap-1.5 text-xs text-white/40">
                  <Share2 className="h-3.5 w-3.5" /> Share:
                </span>
                {shareTargets.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => shareTo(t.id, plan)}
                    title={`Share to ${t.label}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:border-sky-400/40 hover:bg-white/15 hover:text-white"
                  >
                    <t.icon className="h-3.5 w-3.5" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => copyLink(plan)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/15"
                >
                  <Link2 className="h-3.5 w-3.5" /> Copy link
                </button>
                <a
                  href={`/plan/${plan.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`/plan/${plan.id}`, "_blank");
                  }}
                  className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-sky-300 hover:text-sky-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Preview public page
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.5-.3-2.9.8.8-2.8-.3-.5A8 8 0 0 1 12 4z" />
      <path d="M9.5 8.5c.3 0 .6 0 .8.5l.7 1.6c.1.3 0 .6-.2.8l-.5.6c-.2.2-.2.4-.1.6.4.8 1.3 1.7 2.2 2.1.3.1.5.1.7-.1l.6-.6c.2-.2.5-.3.8-.2l1.6.8c.4.2.5.5.5.8-.1.9-.9 1.6-1.8 1.6-2.9-.2-5.9-3.2-6.1-6.1 0-.9.7-1.7 1.6-1.8z" />
    </svg>
  );
}
