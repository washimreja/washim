import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { describeWeather, fetchWeather, isPrecipitating, reverseGeocode } from "@/lib/weather";
import type { GeoPlace } from "@/lib/types";

describe("describeWeather", () => {
  it("maps canonical WMO codes to labels", () => {
    expect(describeWeather(0).label).toBe("Clear sky");
    expect(describeWeather(3).short).toBe("Cloudy");
    expect(describeWeather(95).label).toBe("Thunderstorm");
    expect(describeWeather(99).short).toBe("Severe storm");
  });

  it("annotates night conditions", () => {
    expect(describeWeather(0, false).label).toBe("Clear sky · night");
    expect(describeWeather(61, false).short).toBe("Light rain");
  });

  it("handles unknown codes gracefully", () => {
    expect(describeWeather(1234).label).toBe("Unknown");
    expect(describeWeather(1234).short).toBe("—");
  });
});

describe("isPrecipitating", () => {
  it("is true for drizzle, rain, snow, showers, and storms", () => {
    for (const code of [51, 63, 65, 71, 75, 80, 85, 95, 96, 99]) {
      expect(isPrecipitating(code), `code ${code}`).toBe(true);
    }
  });

  it("is false for clear, cloudy, fog, and unknown codes", () => {
    for (const code of [0, 1, 2, 3, 45, 48, 50, 90, 1234]) {
      expect(isPrecipitating(code), `code ${code}`).toBe(false);
    }
  });

  it("draws the boundary exactly at the WMO ranges", () => {
    expect(isPrecipitating(50)).toBe(false);
    expect(isPrecipitating(51)).toBe(true);
    expect(isPrecipitating(67)).toBe(true);
    expect(isPrecipitating(68)).toBe(false);
    expect(isPrecipitating(70)).toBe(false);
    expect(isPrecipitating(71)).toBe(true);
    expect(isPrecipitating(86)).toBe(true);
    expect(isPrecipitating(87)).toBe(false);
    expect(isPrecipitating(94)).toBe(false);
    expect(isPrecipitating(95)).toBe(true);
  });
});

describe("reverseGeocode", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns the first geocoding hit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          results: [{ id: 7, name: "Somewhere", latitude: 1.2, longitude: 3.4, country: "Testland" }],
        }),
      }))
    );
    const place = await reverseGeocode(1.2, 3.4);
    expect(place?.name).toBe("Somewhere");
    expect(place?.country).toBe("Testland");
  });

  it("falls back to a coordinate place when geocoding yields nothing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({}) })));
    const place = await reverseGeocode(45.678, -73.456);
    expect(place).not.toBeNull();
    expect(place?.name).toBe("My location");
    expect(place?.admin1).toContain("45.68°N");
    expect(place?.admin1).toContain("73.46°W");
  });

  it("falls back when the geocoding fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));
    const place = await reverseGeocode(10, 20);
    expect(place?.name).toBe("My location");
  });
});

describe("fetchWeather", () => {
  const place: GeoPlace = { id: 1, name: "Testville", latitude: 40, longitude: -70 };

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          timezone: "America/New_York",
          utc_offset_seconds: -14400,
          current: {
            temperature_2m: 21.4,
            apparent_temperature: 23.1,
            relative_humidity_2m: 61,
            wind_speed_10m: 12.3,
            wind_gusts_10m: 25.6,
            wind_direction_10m: 210,
            surface_pressure: 1014.2,
            cloud_cover: 35,
            visibility: 24140,
            uv_index: 4.5,
            precipitation: 0.1,
            weather_code: 2,
            is_day: 1,
          },
          hourly: {
            time: ["2026-09-21T10:00", "2026-09-21T11:00"],
            temperature_2m: [20.5, 21.9],
            apparent_temperature: [21.2, 23.4],
            precipitation_probability: [12, 30],
            precipitation: [0, 0.2],
            weather_code: [1, 2],
            wind_speed_10m: [11, 14],
            uv_index: [3.2, 4.8],
            relative_humidity_2m: [58, 63],
            cloud_cover: [30, 55],
            is_day: [1, 1],
          },
          daily: {
            time: ["2026-09-21"],
            weather_code: [2],
            temperature_2m_max: [24.1],
            temperature_2m_min: [14.3],
            precipitation_sum: [0.3],
            precipitation_hours: [0.5],
            precipitation_probability_max: [30],
            wind_speed_10m_max: [15],
            wind_gusts_10m_max: [28],
            uv_index_max: [5.2],
            sunrise: ["2026-09-21T06:45"],
            sunset: ["2026-09-21T18:55"],
          },
        }),
      }))
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("maps the Open-Meteo payload into WeatherData", async () => {
    const data = await fetchWeather(place);
    expect(data.place).toEqual(place);
    expect(data.timezone).toBe("America/New_York");
    expect(data.utcOffsetSeconds).toBe(-14400);
    expect(data.current.temperature).toBeCloseTo(21.4);
    expect(data.current.apparentTemperature).toBeCloseTo(23.1);
    expect(data.current.isDay).toBe(true);
    expect(data.hourly).toHaveLength(2);
    expect(data.hourly[1].temperature).toBeCloseTo(21.9);
    expect(data.hourly[1].precipitationProbability).toBe(30);
    expect(data.hourly[1].cloudCover).toBe(55);
    expect(data.daily[0].tempMax).toBeCloseTo(24.1);
    expect(data.daily[0].uvIndexMax).toBeCloseTo(5.2);
    expect(data.daily[0].sunrise).toBe("2026-09-21T06:45");
    expect(typeof data.fetchedAt).toBe("number");
  });

  it("throws a friendly error when the service is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 503 })));
    await expect(fetchWeather(place)).rejects.toThrow("Weather service unavailable");
  });

  it("coerces missing hourly values to 0 instead of NaN", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          timezone: "UTC",
          utc_offset_seconds: 0,
          current: { temperature_2m: 10, is_day: 0 },
          hourly: { time: ["2026-09-21T10:00"], temperature_2m: [null] },
          daily: { time: ["2026-09-21"], sunrise: [null], sunset: ["2026-09-21T18:00"] },
        }),
      }))
    );
    const data = await fetchWeather(place);
    expect(data.hourly[0].temperature).toBe(0);
    expect(data.current.isDay).toBe(false);
    expect(data.daily[0].sunrise).toBe("");
  });
});
