import { Link, useNavigate } from "react-router-dom";
import { CloudSun, LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrolled } from "@/hooks/useSticky";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

interface Props {
  user: UserProfile | null;
}

export default function Navbar({ user }: Props) {
  const scrolled = useScrolled(16);
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "border-b border-night-700/60 bg-night-900/85 py-2.5 backdrop-blur-xl" : "bg-transparent py-4"
      )}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-glow-sm transition-transform group-hover:scale-105">
            <CloudSun className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Sky<span className="text-gradient-dark">Sense</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            ["Features", "#features"],
            ["Intelligence", "#intelligence"],
            ["Community", "#community"],
            ["Pricing", "#pricing"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="light" size="sm" onClick={() => navigate("/dashboard")} className="h-9">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="hidden h-9 text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex">
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
              <Button variant="light" size="sm" onClick={() => navigate("/auth?mode=signup")} className="h-9">
                Get started free
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
