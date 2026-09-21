import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CloudSun, LayoutDashboard, LogOut, Menu, Settings, Sparkles, CalendarDays, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/insights", label: "AI Insights", icon: Sparkles },
  { to: "/dashboard/planner", label: "Planner & Sharing", icon: CalendarDays },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-night-900 text-white">
      {/* ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/3 h-[420px] w-[640px] rounded-full bg-sky-600/15 blur-[130px] animate-aurora" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[480px] rounded-full bg-indigo-600/10 blur-[120px] animate-aurora" style={{ animationDelay: "-8s" }} />
        <div className="absolute inset-0 dots-dark opacity-40" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl">
        {/* sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-night-950/95 backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-6 pb-4">
            <NavLink to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-glow-sm">
                <CloudSun className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-lg font-bold">
                Sky<span className="text-gradient-dark">Sense</span>
              </span>
            </NavLink>
            <button
              type="button"
              className="text-white/50 hover:text-white lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/50 to-indigo-500/50 font-display text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-white/45">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  navigate("/");
                }}
                title="Sign out"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* mobile topbar */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-night-900/85 px-4 py-3 backdrop-blur-xl lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display font-bold">SkySense</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/50 to-indigo-500/50 text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
