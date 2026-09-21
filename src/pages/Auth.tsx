import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CloudSun, Loader2, Lock, Mail, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

function returnToFromParams(params: URLSearchParams): string {
  const raw = params.get("returnTo") || "/dashboard";
  return raw.startsWith("/") ? raw : "/dashboard";
}

export default function Auth() {
  const { user, ready, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = returnToFromParams(params);
  const [mode, setMode] = useState<"signin" | "signup">(
    params.get("mode") === "signup" ? "signup" : "signin"
  );

  // Redirect if already signed in (effect-free: guarded in render below).
  const signedIn = ready && !!user;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (mode === "signup") return name.trim().length > 0 && email.includes("@") && password.length >= 6;
    return email.includes("@") && password.length > 0;
  }, [mode, name, email, password]);

  if (signedIn) {
    return (
      <NavigateOnce to={returnTo} />
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") await signUp(name.trim(), email.trim(), password);
      else await signIn(email.trim(), password);
      toast.success(
        mode === "signup" ? "Welcome to SkySense — your forecasts are personalized from day one." : "Welcome back."
      );
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
    setBusy(false);
    }
  }

  function autofillDemo() {
    setMode("signin");
    setEmail("demo@skysense.app");
    setPassword("demo1234");
    setError(null);
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-night-900 text-white">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-sky-500/20 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[420px] rounded-full bg-indigo-500/15 blur-[110px]" />
        <div className="absolute inset-0 dots-dark opacity-60" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* left: brand story */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <Link to="/" className="mb-10 inline-flex items-center gap-2.5 text-white/80 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to site
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-glow">
                <CloudSun className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-xl font-bold">
                Sky<span className="text-gradient-dark">Sense</span>
              </span>
            </div>
            <h1 className="mt-8 font-display text-4xl font-bold leading-tight">
              Weather that
              <br />
              <span className="text-gradient-dark">thinks ahead.</span>
            </h1>
            <p className="mt-4 max-w-md text-white/60">
              Hyperlocal forecasts, smart alerts and a planning assistant that learns how you move through
              the week. Your first insight is seconds away.
            </p>
            <ul className="mt-10 space-y-4 text-sm text-white/70">
              {[
                "Real-time conditions refreshed every 10 minutes",
                "Smart alerts tuned to your comfort thresholds",
                "One-tap sharing to X, WhatsApp and Facebook",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                    <Sparkles className="h-3 w-3" />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              <span className="font-semibold text-white">Just looking around?</span> Use the demo account —{" "}
              <button type="button" onClick={autofillDemo} className="text-sky-300 underline underline-offset-4 hover:text-sky-200">
                autofill demo credentials
              </button>
              .
            </div>
          </motion.div>

          {/* right: form card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="glass-dark rounded-3xl p-8">
              <div className="mb-6 flex items-center justify-between lg:hidden">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
                  <ArrowLeft className="h-4 w-4" /> Home
                </Link>
                <Link to="/" className="flex items-center gap-2 font-display font-bold">
                  <CloudSun className="h-5 w-5 text-sky-400" /> SkySense
                </Link>
              </div>

              <h2 className="font-display text-2xl font-bold">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-sm text-white/55">
                {mode === "signin"
                  ? "Sign in to your personalized forecast."
                  : "Free forever for personal use. No credit card."}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === "signup" && (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50">Full name</span>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Alex Rivera"
                        className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-white/35 focus:border-sky-400/70 focus:bg-white/10"
                      />
                    </div>
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50">Email</span>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-white/35 focus:border-sky-400/70 focus:bg-white/10"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50">Password</span>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={mode === "signup" ? 6 : 1}
                      placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                      className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-white/35 focus:border-sky-400/70 focus:bg-white/10"
                    />
                  </div>
                </label>

                {error && (
                  <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">{error}</p>
                )}

                <Button type="submit" disabled={!canSubmit || busy} className="h-11 w-full">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {mode === "signin" ? "Sign in" : "Create account"}
                  {!busy && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-white/55">
                {mode === "signin" ? (
                  <>
                    New to SkySense?{" "}
                    <button type="button" onClick={() => setMode("signup")} className="font-semibold text-sky-300 hover:text-sky-200">
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => setMode("signin")} className="font-semibold text-sky-300 hover:text-sky-200">
                      Sign in
                    </button>
                  </>
                )}
              </div>

              <div className="mt-6 border-t border-white/10 pt-5 text-center lg:hidden">
                <button type="button" onClick={autofillDemo} className="text-xs text-white/50 underline underline-offset-4 hover:text-white/80">
                  Use demo account (demo@skysense.app / demo1234)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function NavigateOnce({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace: true });
  }, [to, navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-night-900 text-white/70">
      <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
    </div>
  );
}
