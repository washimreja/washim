import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Navigation, Search } from "lucide-react";
import { searchPlaces } from "@/lib/weather";
import type { GeoPlace } from "@/lib/types";
import { placeLabel } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (place: GeoPlace) => void;
  placeholder?: string;
  className?: string;
  variant?: "light" | "dark";
  allowLocate?: boolean;
}

export default function LocationSearch({
  onSelect,
  placeholder = "Search any city…",
  className,
  variant = "light",
  allowLocate = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setBusy(true);
    const t = setTimeout(() => {
      searchPlaces(query.trim())
        .then((r) => {
          setResults(r);
          setOpen(true);
          setHighlight(0);
        })
        .catch(() => setResults([]))
        .finally(() => setBusy(false));
    }, 300);
    return () => {
      clearTimeout(t);
      setBusy(false);
    };
  }, [query]);

  function pick(p: GeoPlace) {
    onSelect(p);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function locate() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void searchPlaces(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`, 1)
          .then((r) => {
            if (r[0]) pick(r[0]);
          })
          .finally(() => setLocating(false));
      },
      () => setLocating(false),
      { timeout: 8000, maximumAge: 300000 }
    );
  }

  const dark = variant === "dark";

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border px-4 transition-colors",
          dark
            ? "border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-within:border-sky-400/60 focus-within:bg-white/15"
            : "border-input bg-card text-foreground focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20"
        )}
      >
        <Search className={cn("h-4 w-4 shrink-0", dark ? "text-white/60" : "text-muted-foreground")} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && results[highlight]) {
              e.preventDefault();
              pick(results[highlight]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          className={cn(
            "h-11 w-full bg-transparent text-sm outline-none",
            dark && "placeholder:text-white/50"
          )}
          aria-label="Search for a city"
        />
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {allowLocate && (
          <button
            type="button"
            onClick={locate}
            title="Use my location"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
              dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-secondary text-foreground hover:bg-secondary/70"
            )}
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          className={cn(
            "absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border p-1.5 shadow-xl",
            dark ? "border-white/15 bg-night-850/95 backdrop-blur-xl" : "border-border bg-card"
          )}
          role="listbox"
        >
          {results.map((r, i) => (
            <li key={`${r.id}-${i}`}>
              <button
                type="button"
                onClick={() => pick(r)}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  i === highlight
                    ? dark
                      ? "bg-white/10 text-white"
                      : "bg-accent text-accent-foreground"
                    : dark
                      ? "text-white/75"
                      : "text-foreground"
                )}
              >
                <MapPin className="h-4 w-4 shrink-0 text-sky-500" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className={cn("block truncate text-xs", dark ? "text-white/50" : "text-muted-foreground")}>
                    {placeLabel(r).replace(`${r.name}, `, "") || "—"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
