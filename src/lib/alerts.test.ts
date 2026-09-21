import { describe, expect, it } from "vitest";
import { deriveAlerts } from "@/lib/alerts";
import { hour, hourFromNow, makeWeather } from "@/lib/testFixtures";
import type { DailyPoint, WeatherData } from "@/lib/types";

/* ---------- helpers ---------- */

function setDaily(data: WeatherData, overrides: Partial<DailyPoint>): WeatherData {
  return { ...data, daily: [{ ...data.daily[0], ...overrides }] };
}

describe("deriveAlerts", () => {
  const day = "2026-09-21";

  it("returns no alerts for benign weather", () => {
    const data = setDaily(makeWeather([hour()]), {
      weatherCode: 1,
      tempMax: 22,
      tempMin: 12,
      precipitationSum: 0.5,
      precipitationProbability: 10,
      windGustsMax: 30,
      uvIndexMax: 5,
    });
    expect(deriveAlerts(data)).toHaveLength(0);
  });

  it("raises a severe storm alert with a window on thunderstorm codes", () => {
    const alerts = deriveAlerts(setDaily(makeWeather([hour()]), { weatherCode: 95 }));
    const storm = alerts.find((a) => a.id === "storm");
    expect(storm).toBeDefined();
    expect(storm!.severity).toBe("severe");
    expect(storm!.window).toEqual({ start: `${day}T00:00`, end: `${day}T23:59` });
  });

  it("raises a storm alert from the current code even when no daily match", () => {
    const base = makeWeather([hour()]);
    const data: WeatherData = {
      ...base,
      current: { ...base.current, weatherCode: 95 },
      daily: [{ ...base.daily[0], weatherCode: 1 }],
    };
    expect(deriveAlerts(data).find((a) => a.id === "storm")).toBeDefined();
  });

  it("flags gusts ≥ 55 km/h as moderate and ≥ 75 as severe", () => {
    const moderate = deriveAlerts(setDaily(makeWeather([hour()]), { windGustsMax: 60 }));
    const severe = deriveAlerts(setDaily(makeWeather([hour()]), { windGustsMax: 80 }));
    expect(moderate.find((a) => a.id === "wind")!.severity).toBe("moderate");
    expect(severe.find((a) => a.id === "wind")!.severity).toBe("severe");
  });

  it("does not flag gusts below 55 km/h", () => {
    const alerts = deriveAlerts(setDaily(makeWeather([hour()]), { windGustsMax: 40 }));
    expect(alerts.find((a) => a.id === "wind")).toBeUndefined();
  });

  it("alerts on frost when an overnight low hits freezing", () => {
    const frost = deriveAlerts(setDaily(makeWeather([hour()]), { tempMin: -2 })).find((a) => a.id === "frost");
    expect(frost).toBeDefined();
    expect(frost!.severity).toBe("moderate");
    expect(frost!.description).toContain("-2°C");
  });

  it("escalates heat to severe at ≥ 38°C", () => {
    const hot = deriveAlerts(setDaily(makeWeather([hour()]), { tempMax: 34 }));
    const dangerous = deriveAlerts(setDaily(makeWeather([hour()]), { tempMax: 39 }));
    expect(hot.find((a) => a.id === "heat")!.severity).toBe("moderate");
    expect(dangerous.find((a) => a.id === "heat")!.severity).toBe("severe");
    expect(dangerous.find((a) => a.id === "heat")!.description).toContain("dangerous heat");
  });

  it("warns on very high UV", () => {
    const uv = deriveAlerts(setDaily(makeWeather([hour()]), { uvIndexMax: 9 })).find((a) => a.id === "uv");
    expect(uv).toBeDefined();
    expect(uv!.description).toContain("9");
  });

  it("flags a washout by precipitation sum and by probability", () => {
    const bySum = deriveAlerts(setDaily(makeWeather([hour()]), { precipitationSum: 20 })).find((a) => a.id === "rain");
    expect(bySum).toBeDefined();
    expect(bySum!.description).toContain("20 mm");

    const byProb = deriveAlerts(setDaily(makeWeather([hour()]), { precipitationProbability: 80 })).find(
      (a) => a.id === "rain"
    );
    expect(byProb).toBeDefined();
  });

  it("opens a dry-window alert after 10+ dry hours", () => {
    const hours = Array.from({ length: 12 }, (_, i) => hourFromNow(i, { precipitationProbability: 10 }));
    const dry = deriveAlerts(makeWeather(hours)).find((a) => a.id === "dry-window");
    expect(dry).toBeDefined();
    expect(dry!.severity).toBe("info");
    expect(dry!.description).toContain("12 hours");
  });

  it("does not open a dry-window when rain interrupts the streak", () => {
    const hours = [
      ...Array.from({ length: 5 }, (_, i) => hourFromNow(i, { precipitationProbability: 10 })),
      hourFromNow(5, { precipitationProbability: 90 }),
      ...Array.from({ length: 5 }, (_, i) => hourFromNow(i + 6, { precipitationProbability: 10 })),
    ];
    expect(deriveAlerts(makeWeather(hours)).find((a) => a.id === "dry-window")).toBeUndefined();
  });
});
