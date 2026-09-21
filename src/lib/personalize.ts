import type {
  ActivityConditions,
  ActivityProfile,
  ActivityRecommendation,
  ComfortPrefs,
  HourlyPoint,
  Insight,
  UserProfile,
  WeatherData,
} from "./types";
import { clamp } from "./format";
import { isPrecipitating } from "./weather";

export const ACTIVITIES: ActivityProfile[] = [
  {
    id: "running",
    label: "Running",
    icon: "Footprints",
    score: (c) => {
      let s = 100;
      const comfort = clamp(100 - Math.abs(c.apparentC - 12) * 6.5, 0, 100);
      s = s * 0.45 + comfort * 0.55;
      s -= c.precipitationProb > 25 ? (c.precipitationProb - 25) * 0.9 : 0;
      s -= Math.max(0, c.windMax - 18) * 1.4;
      if (c.uvIndexMax >= 8) s -= 8;
      return clamp(s, 0, 100);
    },
  },
  {
    id: "cycling",
    label: "Cycling",
    icon: "Bike",
    score: (c) => {
      let s = clamp(100 - Math.abs(c.apparentC - 16) * 5.5, 0, 100);
      s -= Math.max(0, c.windMax - 12) * 2.4;
      s -= Math.max(0, c.windMax - 30) * 2;
      s -= c.precipitationProb > 20 ? (c.precipitationProb - 20) * 1.1 : 0;
      return clamp(s, 0, 100);
    },
  },
  {
    id: "hiking",
    label: "Hiking",
    icon: "Mountain",
    score: (c) => {
      let s = clamp(100 - Math.abs(c.apparentC - 14) * 5, 0, 100);
      s -= c.precipitationProb > 35 ? (c.precipitationProb - 35) * 0.9 : 0;
      s -= Math.max(0, c.windMax - 25) * 1.6;
      if (c.uvIndexMax >= 9) s -= 6;
      return clamp(s, 0, 100);
    },
  },
  {
    id: "photography",
    label: "Photography",
    icon: "Camera",
    score: (c) => {
      // Golden clouds beat flat blue skies; light rain = moody shots.
      let s = 62 + (c.cloudCoverPct > 20 && c.cloudCoverPct < 75 ? 22 : 0);
      if (c.precipitationProb > 55 && c.precipitationProb < 90) s += 8;
      s -= c.precipitationProb > 90 ? 25 : 0;
      s -= Math.max(0, c.windMax - 35) * 1.2;
      return clamp(s, 0, 100);
    },
  },
  {
    id: "picnic",
    label: "Picnic",
    icon: "Sandwich",
    score: (c) => {
      let s = clamp(100 - Math.abs(c.apparentC - 22) * 6, 0, 100);
      s -= Math.max(0, c.windMax - 14) * 2.2;
      s -= c.precipitationProb > 15 ? (c.precipitationProb - 15) * 1.4 : 0;
      if (c.uvIndexMax >= 9) s -= 6;
      return clamp(s, 0, 100);
    },
  },
  {
    id: "stargazing",
    label: "Stargazing",
    icon: "Telescope",
    score: (c) => {
      let s = clamp(100 - c.cloudCoverPct * 1.1, 0, 100);
      s -= c.precipitationProb > 40 ? 35 : 0;
      s -= Math.max(0, c.windMax - 10) * 1.8;
      return clamp(s, 0, 100);
    },
  },
  {
    id: "indoor",
    label: "Indoor gym",
    icon: "Dumbbell",
    score: (c) => {
      // Inverse of outdoor comfort: bad weather = good gym day.
      let s = 55;
      s += clamp((c.precipitationProb - 40) * 0.5, 0, 30);
      s += clamp((Math.abs(c.apparentC - 16) - 8) * 1.2, 0, 25);
      s -= clamp((25 - Math.abs(c.apparentC - 16)) * 0.8, 0, 20);
      return clamp(s, 0, 100);
    },
  },
];

export function activityById(id: string): ActivityProfile | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

function bandOf(score: number): ActivityRecommendation["band"] {
  if (score >= 78) return "great";
  if (score >= 62) return "good";
  if (score >= 45) return "fair";
  return "poor";
}

function conditionsFor(h: HourlyPoint): ActivityConditions {
  return {
    tempC: h.temperature,
    apparentC: h.apparentTemperature,
    precipitationProb: h.precipitationProbability,
    windMax: h.windSpeed,
    uvIndexMax: h.uvIndex,
    cloudCoverPct: h.cloudCover,
  };
}

function bestHours(hours: HourlyPoint[], activity: ActivityProfile, count = 3): HourlyPoint[] {
  return [...hours]
    .map((h) => ({ h, s: activity.score(conditionsFor(h)) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, count)
    .map((x) => x.h);
}

function reasonsFor(activity: ActivityProfile, c: ActivityConditions): string[] {
  const reasons: string[] = [];
  const tempDiff = Math.abs(c.apparentC - (activity.id === "indoor" ? 16 : 18));
  if (tempDiff < 6) reasons.push(`feels-like ${Math.round(c.apparentC)}°C sits in your comfort band`);
  if (c.precipitationProb <= 20) reasons.push(`only ${Math.round(c.precipitationProb)}% rain chance`);
  if (c.precipitationProb > 60) reasons.push(`${Math.round(c.precipitationProb)}% rain chance`);
  if (c.windMax > 30) reasons.push(`windy — ${Math.round(c.windMax)} km/h`);
  if (activity.id === "stargazing" && c.cloudCoverPct < 25) reasons.push("skies mostly clear");
  if (activity.id === "photography" && c.cloudCoverPct > 20 && c.cloudCoverPct < 75)
    reasons.push("scattered clouds add texture to light");
  return reasons.slice(0, 2);
}

/** Score an activity against an hourly window. */
export function scoreActivity(
  activity: ActivityProfile,
  hours: HourlyPoint[],
  user: UserProfile | null
): ActivityRecommendation {
  const interest = user?.activityWeights[activity.id] ?? 0.5;
  const best = bestHours(hours, activity, 4);
  const c = conditionsFor(best[0] ?? hours[0]);
  const base = activity.score(c);
  // Blend objective conditions with the user's learned interest.
  const score = clamp(base * (1 - 0.25 * interest) + interest * 25, 0, 100);
  return {
    activity,
    score: Math.round(score),
    band: bandOf(score),
    reasons: reasonsFor(activity, c),
  };
}

/** Rank all activities for a window, personalized by interest weights. */
export function rankActivities(hours: HourlyPoint[], user: UserProfile | null): ActivityRecommendation[] {
  return ACTIVITIES.map((a) => scoreActivity(a, hours, user)).sort((a, b) => b.score - a.score);
}

/** Hours for "today" (or a given day offset), from now onward. */
export function windowHours(data: WeatherData, dayOffset = 0, count = 12): HourlyPoint[] {
  const day = new Date();
  day.setDate(day.getDate() + dayOffset);
  const key = day.toISOString().slice(0, 10);
  const startIdx = data.hourly.findIndex((h) => h.time.slice(0, 10) === key);
  if (startIdx === -1) return data.hourly.slice(0, count);
  const from = dayOffset === 0 ? Math.max(startIdx, data.hourly.findIndex((h) => new Date(h.time).getTime() >= Date.now() - 3600_000)) : startIdx;
  return data.hourly.slice(Math.max(0, from), Math.max(0, from) + count);
}

/* ---------- Insights ("ML" pattern layer) ---------- */

export function generateInsights(data: WeatherData, user: UserProfile | null): Insight[] {
  const insights: Insight[] = [];
  const comfort: ComfortPrefs =
    user?.comfort ?? { heatC: 28, coldC: 5, rainTolerance: 35, windTolerance: 5, sunLove: 30, intensity: "steady" };
  const next48 = windowHours(data, 0, 48).length
    ? [...windowHours(data, 0, 12), ...windowHours(data, 1, 24)]
    : data.hourly.slice(0, 36);

  // Comfort crossing — heat
  const hotHour = next48.find((h) => h.apparentTemperature >= comfort.heatC);
  if (hotHour) {
    insights.push({
      id: "cross-heat",
      kind: "warning",
      icon: "ThermometerSun",
      title: "You'll hit your heat threshold",
      body: `Feels-like crosses ${comfort.heatC}°C around ${new Date(hotHour.time).toLocaleTimeString([], { hour: "numeric", hour12: true })}. Based on your profile, that's when workouts feel heavy — front-load them.`,
    });
  }

  // Comfort crossing — cold
  const coldHour = next48.find((h) => h.apparentTemperature <= comfort.coldC);
  if (coldHour) {
    insights.push({
      id: "cross-cold",
      kind: "tip",
      icon: "ThermometerSnowflake",
      title: "Layer up tomorrow morning",
      body: `Dips to ${Math.round(coldHour.apparentTemperature)}°C — below your ${comfort.coldC}°C comfort floor. Warm layer for the ${new Date(coldHour.time).toLocaleTimeString([], { weekday: "short", hour: "numeric", hour12: true })} stretch.`,
    });
  }

  // Rain vs tolerance
  const rainHours = next48.filter((h) => h.precipitationProbability >= Math.max(50, comfort.rainTolerance + 15));
  if (rainHours.length >= 3) {
    insights.push({
      id: "rain-block",
      kind: "warning",
      icon: "CloudRain",
      title: "A wet stretch is coming",
      body: `${rainHours.length} hours clear your rain-comfort limit (${comfort.rainTolerance}% tolerance). SkySense moved indoor-gym scores up automatically.`,
    });
  }

  // Pattern: diurnal stability
  const temps = next48.slice(0, 24).map((h) => h.temperature);
  const spread = temps.length ? Math.max(...temps) - Math.min(...temps) : 0;
  if (spread < 6) {
    insights.push({
      id: "stable",
      kind: "pattern",
      icon: "Waves",
      title: "Unusually stable day",
      body: `Temperature swings only ${spread.toFixed(1)}°C over 24h — your gear choices from this morning still hold tonight.`,
    });
  }

  // Learned pattern from interactions
  const top = user ? Object.entries(user.activityWeights).sort((a, b) => b[1] - a[1])[0] : undefined;
  if (top && top[1] > 0.6) {
    const act = activityById(top[0]);
    if (act) {
      const best = bestHours(next48, act, 1)[0];
      if (best) {
        insights.push({
          id: "learned-top",
          kind: "tip",
          icon: "Sparkles",
          title: `Your ${act.label.toLowerCase()} window`,
          body: `SkySense has learned ${act.label.toLowerCase()} is your go-to. The best conditions land around ${new Date(best.time).toLocaleTimeString([], { weekday: "short", hour: "numeric", hour12: true })} — I've pinned it in your planner.`,
        });
      }
    }
  }

  // Wind vs tolerance
  const windy = next48.find((h) => h.windSpeed >= comfort.windTolerance * 8 + 15);
  if (windy) {
    insights.push({
      id: "wind",
      kind: "warning",
      icon: "Wind",
      title: "Wind past your tolerance",
      body: `${Math.round(windy.windSpeed)} km/h expected around ${new Date(windy.time).toLocaleTimeString([], { hour: "numeric", hour12: true })} — above the ${comfort.windTolerance} level you've told me feels fine. High-resistance rides will suffer.`,
    });
  }

  return insights.slice(0, 5);
}

/** Currently precipitating right now? */
export function rainingNow(data: WeatherData): boolean {
  return isPrecipitating(data.current.weatherCode);
}
