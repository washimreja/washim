import { useEffect, useState } from "react";
import { Brain, MapPin, Save, Thermometer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import LocationSearch from "@/components/LocationSearch";
import { ACTIVITIES } from "@/lib/personalize";
import { placeLabel } from "@/lib/store";
import type { ComfortPrefs } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [comfort, setComfort] = useState<ComfortPrefs>(
    user?.comfort ?? { heatC: 28, coldC: 5, rainTolerance: 35, windTolerance: 5, sunLove: 30, intensity: "steady" }
  );
  const [weights, setWeights] = useState<Record<string, number>>(user?.activityWeights ?? {});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user) {
      setComfort(user.comfort);
      setWeights(user.activityWeights);
      setDirty(false);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  function save() {
    updateProfile((prev) => ({
      ...prev,
      comfort,
      activityWeights: weights,
    }));
    setDirty(false);
    toast.success("Preferences saved — scores re-ranked.");
  }

  function setComfortField<K extends keyof ComfortPrefs>(key: K, value: ComfortPrefs[K]) {
    setComfort((c) => ({ ...c, [key]: value }));
    setDirty(true);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-white/50">
          These drive the personalization engine — every score adapts the moment you save.
        </p>
      </div>

      {/* home place */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="flex items-center gap-2 font-display font-bold">
          <MapPin className="h-4 w-4 text-sky-400" /> Home location
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Currently: <span className="font-medium text-white">{user.homePlace ? placeLabel(user.homePlace) : "not set"}</span>
        </p>
        <div className="mt-4 max-w-md">
          <LocationSearch
            onSelect={(p) => {
              updateProfile((prev) => ({ ...prev, homePlace: p }));
              toast.success(`${p.name} is now your home location`);
            }}
            placeholder="Search for your city…"
            allowLocate
          />
        </div>
      </section>

      {/* comfort thresholds */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="flex items-center gap-2 font-display font-bold">
          <Thermometer className="h-4 w-4 text-sky-400" /> Comfort thresholds
        </h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <SliderRow
            label="Feels hot above"
            value={comfort.heatC}
            display={`${comfort.heatC}°C`}
            min={20}
            max={40}
            onChange={(v) => setComfortField("heatC", v)}
          />
          <SliderRow
            label="Feels cold below"
            value={comfort.coldC}
            display={`${comfort.coldC}°C`}
            min={-10}
            max={18}
            onChange={(v) => setComfortField("coldC", v)}
          />
          <SliderRow
            label="Rain tolerance"
            value={comfort.rainTolerance}
            display={`${comfort.rainTolerance}%`}
            min={0}
            max={80}
            onChange={(v) => setComfortField("rainTolerance", v)}
          />
          <SliderRow
            label="Wind tolerance"
            value={comfort.windTolerance}
            display={`${comfort.windTolerance}`}
            min={0}
            max={10}
            onChange={(v) => setComfortField("windTolerance", v)}
          />
          <SliderRow
            label="Sun love (cloudiness you enjoy)"
            value={comfort.sunLove}
            display={`${comfort.sunLove}%`}
            min={0}
            max={100}
            onChange={(v) => setComfortField("sunLove", v)}
          />
        </div>
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Workout intensity</p>
          <div className="flex gap-2">
            {(["chill", "steady", "intense"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setComfortField("intensity", opt)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
                  comfort.intensity === opt ? "bg-sky-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/15"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* activity interests */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="flex items-center gap-2 font-display font-bold">
          <Brain className="h-4 w-4 text-sky-400" /> Activity interests
        </h2>
        <p className="mt-1 text-sm text-white/50">
          How much each activity matters to you (0–100). This weights the recommendation ranking.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {ACTIVITIES.map((a) => (
            <SliderRow
              key={a.id}
              label={a.label}
              value={Math.round((weights[a.id] ?? 0.5) * 100)}
              display={`${Math.round((weights[a.id] ?? 0.5) * 100)}`}
              min={0}
              max={100}
              onChange={(v) => {
                setWeights((w) => ({ ...w, [a.id]: v / 100 }));
                setDirty(true);
              }}
            />
          ))}
        </div>
      </section>

      {/* sticky save bar */}
      <div className="sticky bottom-4 z-10 rounded-2xl border border-sky-400/30 bg-night-850/95 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-white/60">
            {dirty ? "You have unsaved changes." : "All changes saved."}
          </p>
          <Button onClick={save} disabled={!dirty}>
            <Save className="h-4 w-4" /> Save preferences
          </Button>
        </div>
      </div>

      {/* account */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="font-display font-bold">Account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InfoRow label="Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Member since" value={new Date(user.memberSince).toLocaleDateString()} />
          <InfoRow
            label="Interactions learned from"
            value={`${user.interactions} signals`}
          />
        </div>
      </section>
    </div>
  );
}

function SliderRow({
  label,
  value,
  display,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-white/80">{label}</span>
        <span className="font-display font-bold text-sky-300">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1"
      />
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}


