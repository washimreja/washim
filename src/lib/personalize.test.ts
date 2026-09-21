import { describe, expect, it } from "vitest";
import {
  ACTIVITIES,
  activityById,
  generateInsights,
  rankActivities,
  scoreActivity,
  windowHours,
} from "@/lib/personalize";
import { hour, hourFromNow, makeUser, makeWeather } from "@/lib/testFixtures";
import type { WeatherData } from "@/lib/types";

/* ---------- activity catalog ---------- */

describe("ACTIVITIES catalog", () => {
  it("scores all activities within 0–100 for extreme conditions", () => {
    for (const a of ACTIVITIES) {
      const s = a.score({
        tempC: 50,
        apparentC: 0,
        precipitationProb: 100,
        windMax: 120,
        uvIndexMax: 12,
        cloudCoverPct: 100,
      });
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });

  it("keeps every activity score in range for idyllic conditions", () => {
    for (const a of ACTIVITIES) {
      const s = a.score({
        tempC: 18,
        apparentC: 17,
        precipitationProb: 0,
        windMax: 6,
        uvIndexMax: 3,
        cloudCoverPct: 30,
      });
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });

  it("rewards clear skies for stargazing", () => {
    const stargazing = activityById("stargazing");
    expect(stargazing).toBeDefined();
    const clear = stargazing!.score({ tempC: 15, apparentC: 14, precipitationProb: 0, windMax: 5, uvIndexMax: 0, cloudCoverPct: 5 });
    const cloudy = stargazing!.score({ tempC: 15, apparentC: 14, precipitationProb: 0, windMax: 5, uvIndexMax: 0, cloudCoverPct: 95 });
    expect(clear).toBeGreaterThan(cloudy);
  });

  it("prefers textured skies for photography over flat blue", () => {
    const photo = activityById("photography")!;
    const textured = photo.score({ tempC: 18, apparentC: 17, precipitationProb: 10, windMax: 10, uvIndexMax: 3, cloudCoverPct: 45 });
    const flat = photo.score({ tempC: 18, apparentC: 17, precipitationProb: 10, windMax: 10, uvIndexMax: 3, cloudCoverPct: 0 });
    expect(textured).toBeGreaterThan(flat);
  });

  it("scores indoor gym higher in bad weather", () => {
    const indoor = activityById("indoor")!;
    const stormy = indoor.score({ tempC: 2, apparentC: -2, precipitationProb: 90, windMax: 50, uvIndexMax: 0, cloudCoverPct: 100 });
    const lovely = indoor.score({ tempC: 20, apparentC: 19, precipitationProb: 5, windMax: 8, uvIndexMax: 4, cloudCoverPct: 20 });
    expect(stormy).toBeGreaterThan(lovely);
  });
});

/* ---------- scoreActivity / rankActivities ---------- */

describe("scoreActivity", () => {
  const goodHours = [hour()];

  it("returns a rounded score, a band, and at most 2 reasons", () => {
    const rec = scoreActivity(activityById("running")!, goodHours, null);
    expect(rec.score).toBe(Math.round(rec.score));
    expect(rec.band).toBe("great");
    expect(rec.reasons.length).toBeLessThanOrEqual(2);
    expect(rec.reasons.length).toBeGreaterThan(0);
  });

  it("blends user interest into the score", () => {
    const running = activityById("running")!;
    const low = scoreActivity(running, goodHours, makeUser({ activityWeights: { running: 0 } }));
    const high = scoreActivity(running, goodHours, makeUser({ activityWeights: { running: 1 } }));
    expect(high.score).toBeGreaterThan(low.score);
  });

  it("defaults to a neutral 0.5 interest for unknown users", () => {
    const rec = scoreActivity(activityById("hiking")!, goodHours, null);
    const neutral = scoreActivity(activityById("hiking")!, goodHours, makeUser());
    expect(rec.score).toBe(neutral.score);
  });

  it("degrades the band as conditions worsen", () => {
    const running = activityById("running")!;
    const great = scoreActivity(running, [hour()], null);
    const bad = scoreActivity(
      running,
      [hour({ apparentTemperature: 0, precipitationProbability: 90, windSpeed: 60 })],
      null
    );
    expect(bad.score).toBeLessThan(great.score);
    expect(bad.band).toBe("poor");
  });
});

describe("rankActivities", () => {
  it("returns every activity exactly once, sorted best-first", () => {
    const ranked = rankActivities([hour()], null);
    expect(ranked).toHaveLength(ACTIVITIES.length);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }
    expect(new Set(ranked.map((r) => r.activity.id))).toEqual(new Set(ACTIVITIES.map((a) => a.id)));
  });

  it("re-ranks when user weights change", () => {
    const hours = [hour({ cloudCover: 5 })]; // stargazing-friendly
    const neutral = rankActivities(hours, null);
    const stargazer = rankActivities(
      hours,
      makeUser({ activityWeights: { running: 0, cycling: 0, hiking: 0, photography: 0, picnic: 0, stargazing: 1, indoor: 0 } })
    );
    expect(stargazer[0].activity.id).toBe("stargazing");
    expect(stargazer[0].score).toBeGreaterThan(neutral.find((r) => r.activity.id === "stargazing")!.score);
  });
});

/* ---------- windowHours ---------- */

describe("windowHours", () => {
  it("picks today's remaining hours from now and caps the count", () => {
    const hours = [
      hourFromNow(0),
      hourFromNow(1),
      hourFromNow(2),
      hourFromNow(3),
      hourFromNow(4),
      hourFromNow(24), // tomorrow
    ];
    const win = windowHours(makeWeather(hours), 0, 2);
    expect(win).toHaveLength(2);
    expect(win.map((h) => h.time)).toEqual([hours[0].time, hours[1].time]);
  });

  it("picks a future day's hours from midnight when dayOffset > 0", () => {
    const tomorrowKey = hourFromNow(24).time.slice(0, 10);
    const hours = [hourFromNow(0), hourFromNow(1), hourFromNow(24), hourFromNow(25), hourFromNow(26)];
    const win = windowHours(makeWeather(hours), 1, 2);
    expect(win).toHaveLength(2);
    expect(win.every((h) => h.time.slice(0, 10) === tomorrowKey)).toBe(true);
    expect(win[0].time).toBe(hours[2].time);
  });

  it("falls back to the first hours when the requested day is missing", () => {
    const hours = [hourFromNow(0), hourFromNow(1)];
    expect(windowHours(makeWeather(hours), 5, 4)).toHaveLength(2);
  });
});

/* ---------- generateInsights ---------- */

describe("generateInsights", () => {
  it("warns when feels-like crosses the user's heat threshold", () => {
    const data: WeatherData = makeWeather([hourFromNow(2, { apparentTemperature: 31, temperature: 30 })]);
    const insights = generateInsights(data, makeUser());
    const heat = insights.find((i) => i.id === "cross-heat");
    expect(heat).toBeDefined();
    expect(heat!.kind).toBe("warning");
    expect(heat!.body).toContain("28°C");
  });

  it("never exceeds 5 insights and dedupes ids", () => {
    const data = makeWeather([
      hourFromNow(0, { apparentTemperature: 31, temperature: 30, precipitationProbability: 90, windSpeed: 60 }),
      hourFromNow(1, { apparentTemperature: 29, precipitationProbability: 85, windSpeed: 55 }),
    ]);
    const insights = generateInsights(data, makeUser());
    expect(insights.length).toBeLessThanOrEqual(5);
    expect(new Set(insights.map((i) => i.id)).size).toBe(insights.length);
  });

  it("stays quiet on a perfectly mild day with default comfort", () => {
    const mild = Array.from({ length: 48 }, (_, i) =>
      hourFromNow(i, { apparentTemperature: 17, temperature: 18, precipitationProbability: 5, windSpeed: 8 })
    );
    const insights = generateInsights(makeWeather(mild), makeUser());
    expect(insights.find((i) => i.kind === "warning")).toBeUndefined();
  });

  it("flags a wet stretch above the user's rain tolerance", () => {
    const wet = Array.from({ length: 6 }, (_, i) => hourFromNow(i, { precipitationProbability: 95 }));
    const data = makeWeather(wet);
    const insights = generateInsights(data, makeUser());
    expect(insights.find((i) => i.id === "rain-block")).toBeDefined();
  });

  it("surfaces a learned activity window for strongly-interested users", () => {
    const user = makeUser({
      activityWeights: { running: 0.9, cycling: 0.1, hiking: 0.1, photography: 0.1, picnic: 0.1, stargazing: 0.1, indoor: 0.1 },
    });
    const data = makeWeather([hourFromNow(3, { apparentTemperature: 12, temperature: 12, precipitationProbability: 0, windSpeed: 5 })]);
    const learned = generateInsights(data, user).find((i) => i.id === "learned-top");
    expect(learned).toBeDefined();
    expect(learned!.title).toContain("running");
  });
});
