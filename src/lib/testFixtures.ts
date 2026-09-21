import type { GeoPlace, HourlyPoint, UserProfile, WeatherData } from "@/lib/types";

/** Build an HourlyPoint with sensible defaults; override any field. */
export function hour(partial: Partial<HourlyPoint> = {}): HourlyPoint {
  return {
    time: "2026-09-21T10:00",
    temperature: 18,
    apparentTemperature: 17,
    precipitationProbability: 10,
    precipitation: 0,
    weatherCode: 1,
    windSpeed: 10,
    uvIndex: 3,
    humidity: 55,
    cloudCover: 40,
    isDay: true,
    ...partial,
  };
}

export function makeUser(partial: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "u_test",
    name: "Test",
    email: "t@example.com",
    memberSince: 0,
    homePlace: null,
    favorites: [],
    comfort: { heatC: 28, coldC: 5, rainTolerance: 35, windTolerance: 5, sunLove: 30, intensity: "steady" },
    activityWeights: {
      running: 0.5,
      cycling: 0.5,
      hiking: 0.5,
      photography: 0.5,
      picnic: 0.5,
      stargazing: 0.5,
      indoor: 0.5,
    },
    interactions: 0,
    ...partial,
  };
}

export const testPlace: GeoPlace = { id: 1, name: "Testville", latitude: 40, longitude: -70 };

/** Build a WeatherData whose daily summary matches the first hour's date. */
export function makeWeather(hours: HourlyPoint[]): WeatherData {
  const day = hours[0]?.time.slice(0, 10) ?? "2026-09-21";
  return {
    place: testPlace,
    timezone: "UTC",
    utcOffsetSeconds: 0,
    current: {
      temperature: 18,
      apparentTemperature: 17,
      humidity: 55,
      windSpeed: 10,
      windGusts: 18,
      windDirection: 180,
      pressure: 1015,
      cloudCover: 40,
      visibility: 20000,
      uvIndex: 3,
      precipitation: 0,
      weatherCode: 1,
      isDay: true,
    },
    hourly: hours,
    daily: [
      {
        date: day,
        weatherCode: 1,
        tempMax: 22,
        tempMin: 12,
        precipitationSum: 0.2,
        precipitationHours: 0,
        precipitationProbability: 10,
        windMax: 14,
        windGustsMax: 24,
        uvIndexMax: 5,
        sunrise: `${day}T06:30`,
        sunset: `${day}T19:00`,
      },
    ],
    fetchedAt: 0,
  };
}

/** An hourly point i hours from now, on the hour — matches how windowHours/alerts pick "now". */
export function hourFromNow(i: number, partial: Partial<HourlyPoint> = {}): HourlyPoint {
  const t = new Date();
  t.setMinutes(0, 0, 0);
  t.setHours(t.getHours() + i);
  return hour({ time: `${t.toISOString().slice(0, 13)}:00`, ...partial });
}
