export type TempUnit = "c" | "f";

export function formatTemp(celsius: number, unit: TempUnit): string {
  return unit === "f"
    ? `${Math.round((celsius * 9) / 5 + 32)}°`
    : `${Math.round(celsius)}°`;
}

export function formatTempFull(celsius: number, unit: TempUnit): string {
  return `${formatTemp(celsius, unit)}${unit === "f" ? "F" : "C"}`;
}

export function formatWind(kmh: number, unit: TempUnit): string {
  return unit === "f" ? `${Math.round(kmh * 0.621371)} mph` : `${Math.round(kmh)} km/h`;
}

export function formatPrecip(mm: number): string {
  if (mm >= 1) return `${mm.toFixed(mm >= 10 ? 0 : 1)} mm`;
  return "<1 mm";
}

export function formatHour(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", hour12: true }).replace(" ", "");
}

export function formatDay(isoDate: string, style: "short" | "long" = "short"): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (style === "long") {
    return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  }
  return d.toLocaleDateString([], { weekday: "short" });
}

export function formatClock(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function comfortLabel(uv: number): string {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
