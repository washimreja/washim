import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  Brain,
  Check,
  ChevronDown,
  CloudSun,
  Footprints,
  Gauge,
  MapPin,
  RefreshCw,
  Share2,
  Sparkles,
  Sun,
  Thermometer,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import WeatherDemoCard from "@/components/landing/WeatherDemoCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { ACTIVITIES } from "@/lib/personalize";
import { cn } from "@/lib/utils";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <BackdropScene />
      <Navbar user={user} />
      <main className="relative z-10">
        <Hero user={user} />
        <TrustBar />
        <Features />
        <IntelligenceSection />
        <SharingSection />
        <CommunitySection />
        <Pricing onCta={() => navigate(user ? "/dashboard" : "/auth?mode=signup")} />
        <Faq />
        <FinalCta onCta={() => navigate(user ? "/dashboard" : "/auth?mode=signup")} />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------------- backdrop ---------------- */

function BackdropScene() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* aurora blobs */}
      <div className="absolute -top-40 left-1/4 h-[480px] w-[720px] rounded-full bg-sky-600/20 blur-[140px] animate-aurora" />
      <div className="absolute top-1/3 -right-40 h-[420px] w-[560px] rounded-full bg-indigo-600/15 blur-[130px] animate-aurora" style={{ animationDelay: "-6s" }} />
      <div className="absolute bottom-0 -left-32 h-[380px] w-[480px] rounded-full bg-emerald-500/10 blur-[120px] animate-aurora" style={{ animationDelay: "-12s" }} />
      {/* stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full bg-white animate-twinkle"
          style={{
            left: `${(i * 37 + 13) % 100}%`,
            top: `${(i * 23 + 7) % 100}%`,
            animationDelay: `${(i % 8) * 0.5}s`,
            animationDuration: `${3.5 + (i % 5)}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 dots-dark opacity-50" />
    </div>
  );
}

/* ---------------- hero ---------------- */

function Hero({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  const navigate = useNavigate();
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="container">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge variant="info" className="mb-6 border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              On-device ML · Live data via Open-Meteo
            </Badge>
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Weather that
              <br />
              <span className="text-gradient-dark">thinks ahead.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
              SkySense blends hyperlocal forecasts, smart alerts and an assistant that learns how you move
              through the week — so you never get caught out, and every plan lands in the right weather.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}>
                {user ? "Open your dashboard" : "Start free — no card"}
              </Button>
              <Button size="lg" variant="outline-light" onClick={() => navigate("/auth")}>
                Sign in
              </Button>
              <p className="ml-1 text-xs text-white/40">
                demo@skysense.app · demo1234
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >
            <WeatherDemoCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- trust bar ---------------- */

function TrustBar() {
  const stats = [
    { value: "40k+", label: "cities worldwide" },
    { value: "7-day", label: "hyperlocal forecasts" },
    { value: "<2s", label: "median refresh" },
    { value: "24/7", label: "smart alert monitoring" },
  ];
  return (
    <section className="relative border-y border-white/5 bg-white/[0.02] py-10">
      <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="font-display text-3xl font-bold text-white md:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm text-white/45">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- features ---------------- */

function Features() {
  const items = [
    {
      icon: Gauge,
      title: "Real-time conditions",
      body: "Temperature, feels-like, wind, gusts, humidity, pressure, visibility and UV — refreshed every 10 minutes from a global station mesh.",
      span: "md:col-span-2",
    },
    {
      icon: Activity,
      title: "7-day & hourly forecasts",
      body: "Hourly detail for 48 hours, then daily — with precipitation probability, sunrise and sunset on every card.",
    },
    {
      icon: Bell,
      title: "Smart alerts",
      body: "Storm, gust, frost, heat, UV and washout detection — explained in plain language, before they hit.",
    },
    {
      icon: Share2,
      title: "Share anywhere",
      body: "Send any plan or update to X, WhatsApp, Facebook or copy a public link in one tap.",
    },
    {
      icon: Brain,
      title: "Personal insights",
      body: "Comfort thresholds and activity interests shape every recommendation. Adjust sliders, scores follow.",
      span: "md:col-span-2",
    },
  ];
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Features"
          title="Everything the sky is doing, on one screen"
          sub="Real-time data, deep forecasts and alerts that actually make sense — the full picture without the noise."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className={cn(
                "group rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition-all hover:border-sky-400/40 hover:bg-white/[0.07]",
                f.span
              )}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/25 to-indigo-500/25 text-sky-300 transition-transform group-hover:scale-110">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- intelligence ---------------- */

function IntelligenceSection() {
  const [hour, setHour] = useState(8);
  const score = useMemo(() => Math.round(72 + 24 * Math.sin(((hour - 7) / 11) * Math.PI)), [hour]);
  const band = score >= 78 ? "Great" : score >= 62 ? "Good" : "Fair";
  const reasons =
    score > 88
      ? ["Feels-like near your 16°C sweet spot", "Rain chance under 10%"]
      : score > 72
        ? ["Comfortable feels-like", "Light breeze under 20 km/h"]
        : score > 60
          ? ["Slightly warm by midday", "UV climbing to 7"]
          : ["Above your heat threshold", "Wind gusts picking up"];

  return (
    <section id="intelligence" className="relative py-24 md:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Personal intelligence"
          title="A forecast that learns you"
          sub="SkySense scores every hour against your comfort profile and interests — then explains the why."
        />
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {[
              {
                icon: Thermometer,
                title: "Comfort thresholds",
                body: "Tell SkySense when you run hot or cold. Every score adapts — no generic advice.",
              },
              {
                icon: Brain,
                title: "Interest weighting",
                body: "Rate what you love. Running, cycling, photography — rankings re-tune instantly.",
              },
              {
                icon: Sparkles,
                title: "Explainable recommendations",
                body: "Every score ships with reasons: \"feels-like 18°C sits in your comfort band\" — never a black box.",
              },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                  <b.icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-semibold">{b.title}</h4>
                  <p className="mt-1 text-sm text-white/55">{b.body}</p>
                </div>
              </motion.div>
            ))}
            <p className="pl-1 text-xs text-white/35">
              Scoring runs on-device. Your preferences never leave your browser.
            </p>
          </motion.div>

          {/* interactive scoring demo */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-b from-night-800/80 to-night-900/90 p-7 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Running score · today</p>
                <p className="mt-1 font-display text-2xl font-bold text-white">Interactive demo</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <Footprints className="h-6 w-6" />
              </span>
            </div>

            <div className="mt-6 flex items-end gap-4">
              <span className="font-display text-6xl font-extrabold text-gradient-dark tabular-nums">{score}</span>
              <span className="pb-2 text-sm font-semibold text-white/60">/ 100 · {band}</span>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs text-white/40">
                <span>7:00</span>
                <span>Hour of day</span>
                <span>18:00</span>
              </div>
              <input
                type="range"
                min={7}
                max={18}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="mt-2"
                aria-label="Hour of day"
              />
            </div>

            <div className="mt-6 space-y-2">
              {reasons.map((r) => (
                <div key={r} className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 px-3.5 py-2.5 text-sm text-white/70">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  {r}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {ACTIVITIES.slice(0, 6).map((a) => (
                <span key={a.id} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/50">
                  {a.label}
                </span>
              ))}
              <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[11px] text-sky-300">
                + 1 more
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- sharing ---------------- */

function SharingSection() {
  const [copied, setCopied] = useState(false);
  function copy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <section className="relative py-24 md:py-32">
      <div className="container">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-sky-950/60 via-night-850 to-indigo-950/40">
          <div className="grid items-center gap-10 p-8 md:p-14">
            <div>
              <Badge variant="info" className="mb-5 border border-sky-400/30 bg-sky-500/10 text-sky-200">
                <Share2 className="h-3.5 w-3.5" /> Built for sharing
              </Badge>
              <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
                Plans are better when <span className="text-gradient-dark">everyone sees the sky</span>
              </h2>
              <p className="mt-4 max-w-lg text-white/55">
                Create a plan, add who's coming, and push it to the group chat. Updates to the forecast
                re-score the plan automatically — the crew always sees current conditions.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: Share2, text: "Native share to X, WhatsApp, Facebook — or copy the link" },
                  { icon: RefreshCw, text: "Forecast changes re-score plans and notify the group" },
                  { icon: MapPin, text: "Every plan carries location + best-hour recommendations" },
                ].map((row) => (
                  <li key={row.text} className="flex items-center gap-3 text-sm text-white/70">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sky-300">
                      <row.icon className="h-4 w-4" />
                    </span>
                    {row.text}
                  </li>
                ))}
              </ul>
              <Button className="mt-8" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
                See what's included
              </Button>
            </div>

            {/* share card mock */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: 1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto w-full max-w-sm"
            >
              <div className="rounded-3xl border border-white/15 bg-night-900/90 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Sun className="h-4 w-4 text-amber-300" /> SkySense plan
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">Score 92</span>
                </div>
                <h4 className="mt-4 font-display text-xl font-bold">Sunrise trail run 🏃</h4>
                <p className="text-sm text-white/50">Riverside loop · tomorrow 06:30</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["18°C", "feels like"],
                    ["8%", "rain"],
                    ["12", "km/h"],
                  ].map(([v, l]) => (
                    <div key={l} className="rounded-2xl border border-white/10 bg-white/5 py-3">
                      <p className="font-display text-lg font-bold text-white">{v}</p>
                      <p className="text-[10px] uppercase tracking-wide text-white/40">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span className="text-xs text-white/50">Link ready to paste anywhere</span>
                  <button type="button" onClick={copy} className="text-xs font-semibold text-sky-300 hover:text-sky-200">
                    {copied ? "Copied ✓" : "sky.s/p/8fk2"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- community ---------------- */

function CommunitySection() {
  const posts = [
    { city: "Lisbon", user: "Marta", text: "SkySense moved my shoot to golden hour and nailed it — 40 min window before the front.", tag: "Photography" },
    { city: "Denver", user: "Jake", text: "Frost alert saved my tomatoes twice this month. Worth it for that alone.", tag: "Gardening" },
    { city: "Osaka", user: "Yui", text: "Our cycling group plans every Sunday ride off the shared best-window card now.", tag: "Cycling" },
  ];
  return (
    <section id="community" className="relative py-24 md:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Community"
          title="Trusted by planners, runners & sky watchers"
          sub="Join thousands who start their day with SkySense instead of squinting out the window."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {posts.map((p, i) => (
            <motion.figure
              key={p.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/40 to-indigo-500/40 font-display text-sm font-bold text-white">
                  {p.user[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold">{p.user}</p>
                  <p className="text-xs text-white/40">{p.city}</p>
                </div>
                <span className="ml-auto rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-300">{p.tag}</span>
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-white/70">"{p.text}"</blockquote>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- pricing ---------------- */

function Pricing({ onCta }: { onCta: () => void }) {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "Everything you need to plan your week.",
      features: ["Real-time conditions & 7-day forecast", "3 saved locations", "Core smart alerts", "Activity scores for 2 activities", "Social sharing links"],
      cta: "Start free",
      featured: false,
    },
    {
      name: "Pro",
      price: "$4",
      period: "/ month",
      blurb: "For people whose week lives outdoors.",
      features: ["Unlimited saved locations", "Full alert suite + severity filters", "All 7 activities + custom weights", "Personal insights history", "Priority refresh (1 min)", "Team plans & shared calendars"],
      cta: "Go Pro",
      featured: true,
    },
    {
      name: "Teams",
      price: "$29",
      period: "/ month",
      blurb: "Shared weather intelligence for crews.",
      features: ["Up to 25 seats", "Group plans with roles", "Alert routing to Slack/Teams", "Ops dashboard & CSV export", "SSO & audit log"],
      cta: "Talk to us",
      featured: false,
    },
  ];
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Upgrade when the sky matters more."
          sub="No credit card to begin. Cancel anytime."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cn(
                "relative rounded-3xl border p-8",
                t.featured
                  ? "border-sky-400/50 bg-gradient-to-b from-sky-500/15 to-indigo-500/10 shadow-glow"
                  : "border-white/10 bg-white/[0.04]"
              )}
            >
              {t.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold text-white shadow-glow-sm">
                  MOST POPULAR
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{t.name}</h3>
              <p className="mt-1 text-sm text-white/50">{t.blurb}</p>
              <p className="mt-5">
                <span className="font-display text-4xl font-extrabold">{t.price}</span>
                <span className="ml-1 text-sm text-white/45">{t.period}</span>
              </p>
              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={onCta}
                variant={t.featured ? "default" : "outline-light"}
                className="mt-8 w-full"
              >
                {t.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function Faq() {
  const faqs = [
    {
      q: "Where does the weather data come from?",
      a: "SkySense uses the Open-Meteo network — a blend of national weather services and high-resolution models, refreshed continuously. No API key or account is required; it just works.",
    },
    {
      q: "How does the personalization actually work?",
      a: "You set comfort thresholds (heat, cold, rain, wind, sun) and rate your activities. A scoring model blends live conditions with those weights — and every recommendation ships with the reasons behind it, so you can verify and tune.",
    },
    {
      q: "Is my data private?",
      a: "Preferences and plans are stored on your device. Scoring runs on-device, and nothing is required to sign up but an email. Sharing a plan publishes only that plan's card.",
    },
    {
      q: "Can I share plans with people who don't use SkySense?",
      a: "Yes. Every plan has a public link that renders a clean card with live conditions — recipients don't need an account to see it.",
    },
    {
      q: "Which locations are supported?",
      a: "Over 40,000 cities worldwide via geocoding, plus precise GPS coordinates for anywhere on Earth.",
    },
    {
      q: "What does Pro add over Free?",
      a: "Unlimited locations, the full alert suite, all activity types with custom weights, insight history and priority refresh. Free stays genuinely useful forever.",
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="container max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <button
                type="button"
                onClick={() => setOpen(open === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-semibold">{f.q}</span>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-white/40 transition-transform", open === i && "rotate-180")} />
              </button>
              {open === i && <p className="px-6 pb-5 text-sm leading-relaxed text-white/60">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- final CTA + footer ---------------- */

function FinalCta({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-sky-400/30 bg-gradient-to-br from-sky-600/25 via-night-850 to-indigo-600/25 px-8 py-16 text-center md:py-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-sky-400/25 blur-[100px]" />
          <h2 className="relative font-display text-4xl font-extrabold md:text-5xl">
            Tomorrow's sky, <span className="text-gradient-dark">decoded tonight.</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/60">
            Join free, set your comfort profile once, and let SkySense quietly optimize every hour of your week.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={onCta}>
              Get started — it's free
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="relative border-t border-white/5 bg-night-950/60">
      <div className="container flex flex-col items-center justify-between gap-8 py-12 md:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500">
            <CloudSun className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="font-display font-bold">SkySense</p>
            <p className="text-xs text-white/40">Weather that thinks ahead.</p>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/50">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#intelligence" className="hover:text-white">Intelligence</a>
          <a href="#community" className="hover:text-white">Community</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
          <Link to="/auth" className="hover:text-white">Sign in</Link>
        </nav>
        <p className="text-xs text-white/35">© {new Date().getFullYear()} SkySense Labs. Data by Open-Meteo.</p>
      </div>
    </footer>
  );
}

/* ---------------- shared bits ---------------- */

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-white/55">{sub}</p>}
    </div>
  );
}
