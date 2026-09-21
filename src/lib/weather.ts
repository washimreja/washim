import type { CurrentWeather, DailyPoint, GeoPlace, HourlyPoint, WeatherData } from "./types";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function searchPlaces(query: string, count = 6): Promise<GeoPlace[]> {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=${count}&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding service unavailable");
  const data = (await res.json()) as {
    results?: Array<{
      id: number;
      name: string;
      latitude: number;
      longitude: number;
      country?: string;
      country_code?: string;
      admin1?: string;
      timezone?: string;
      population?: number;
    }>;
  };
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    countryCode: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
    population: r.population,
  }));
}

const HOURLY_VARS = [
  "temperature_2m",
  "apparent_temperature",
  "precipitation_probability",
  "precipitation",
  "weather_code",
  "wind_speed_10m",
  "uv_index",
  "relative_humidity_2m",
  "cloud_cover",
  "is_day",
].join(",");

const DAILY_VARS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "precipitation_hours",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "uv_index_max",
  "sunrise",
  "sunset",
].join(",");

const CURRENT_VARS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
  "surface_pressure",
  "cloud_cover",
  "visibility",
  "uv_index",
  "precipitation",
  "weather_code",
  "is_day",
].join(",");

export async function fetchWeather(place: GeoPlace): Promise<WeatherData> {
  const url =
    `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=${CURRENT_VARS}&hourly=${HOURLY_VARS}&daily=${DAILY_VARS}` +
    `&timezone=auto&forecast_days=7&wind_speed_unit=kmh`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather service unavailable");
  const d = (await res.json()) as {
    timezone: string;
    utc_offset_seconds: number;
    current: Record<string, number | boolean>;
    hourly: Record<string, Array<string | number>>;
    daily: Record<string, Array<string | number>>;
  };

  const c = d.current;
  const current: CurrentWeather = {
    temperature: num(c.temperature_2m),
    apparentTemperature: num(c.apparent_temperature),
    humidity: num(c.relative_humidity_2m),
    windSpeed: num(c.wind_speed_10m),
    windGusts: num(c.wind_gusts_10m),
    windDirection: num(c.wind_direction_10m),
    pressure: num(c.surface_pressure),
    cloudCover: num(c.cloud_cover),
    visibility: num(c.visibility),
    uvIndex: num(c.uv_index),
    precipitation: num(c.precipitation),
    weatherCode: num(c.weather_code),
    isDay: Boolean(c.is_day),
  };

  const h = d.hourly;
  const hourly: HourlyPoint[] = (h.time as string[]).map((t, i) => ({
    time: t,
    temperature: num(h.temperature_2m, i),
    apparentTemperature: num(h.apparent_temperature, i),
    precipitationProbability: num(h.precipitation_probability, i),
    precipitation: num(h.precipitation, i),
    weatherCode: num(h.weather_code, i),
    windSpeed: num(h.wind_speed_10m, i),
    uvIndex: num(h.uv_index, i),
    humidity: num(h.relative_humidity_2m, i),
    cloudCover: num(h.cloud_cover, i),
    isDay: num(h.is_day, i) === 1,
  }));

  const dd = d.daily;
  const daily: DailyPoint[] = (dd.time as string[]).map((t, i) => ({
    date: t,
    weatherCode: num(dd.weather_code, i),
    tempMax: num(dd.temperature_2m_max, i),
    tempMin: num(dd.temperature_2m_min, i),
    precipitationSum: num(dd.precipitation_sum, i),
    precipitationHours: num(dd.precipitation_hours, i),
    precipitationProbability: num(dd.precipitation_probability_max, i),
    windMax: num(dd.wind_speed_10m_max, i),
    windGustsMax: num(dd.wind_gusts_10m_max, i),
    uvIndexMax: num(dd.uv_index_max, i),
    sunrise: String(dd.sunrise[i] ?? ""),
    sunset: String(dd.sunset[i] ?? ""),
  }));

  return {
    place,
    timezone: d.timezone,
    utcOffsetSeconds: d.utc_offset_seconds,
    current,
    hourly,
    daily,
    fetchedAt: Date.now(),
  };
}

function num(v: unknown, i?: number): number {
  const raw = Array.isArray(v) ? v[i ?? 0] : v;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Reverse-locate nearest named place for browser coordinates. */
export async function reverseGeocode(lat: number, lon: number): Promise<GeoPlace | null> {
  try {
    const results = await searchPlaces(`${lat.toFixed(3)}, ${lon.toFixed(3)}`, 1);
    return results[0] ?? fallbackPlace(lat, lon);
  } catch {
    return fallbackPlace(lat, lon);
  }
}

function fallbackPlace(lat: number, lon: number): GeoPlace {
  return {
    id: -1,
    name: "My location",
    admin1: `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`,
    country: "GPS",
    latitude: lat,
    longitude: lon,
  };
}

export function browserLocation(): Promise<GeoPlace | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void reverseGeocode(pos.coords.latitude, pos.coords.longitude).then(resolve);
      },
      () => resolve(null),
      { timeout: 8000, maximumAge: 300000 }
    );
  });
}

/* ---------- WMO weather code decoding ---------- */

export interface WeatherDescriptor {
  label: string;
  short: string;
}

export function describeWeather(code: number, isDay = true): WeatherDescriptor {
  const m: Record<number, [string, string]> = {
    0: ["Clear sky", "Clear"],
    1: ["Mainly clear", "Mostly clear"],
    2: ["Partly cloudy", "Partly cloudy"],
    3: ["Overcast", "Cloudy"],
    45: ["Fog", "Fog"],
    48: ["Depositing rime fog", "Rime fog"],
    51: ["Light drizzle", "Drizzle"],
    53: ["Moderate drizzle", "Drizzle"],
    55: ["Dense drizzle", "Drizzle"],
    56: ["Light freezing drizzle", "Freezing drizzle"],
    57: ["Dense freezing drizzle", "Freezing drizzle"],
    61: ["Slight rain", "Light rain"],
    63: ["Moderate rain", "Rain"],
    65: ["Heavy rain", "Heavy rain"],
    66: ["Light freezing rain", "Freezing rain"],
    67: ["Heavy freezing rain", "Freezing rain"],
    71: ["Slight snowfall", "Light snow"],
    73: ["Moderate snowfall", "Snow"],
    75: ["Heavy snowfall", "Heavy snow"],
    77: ["Snow grains", "Snow grains"],
    80: ["Slight rain showers", "Showers"],
    81: ["Moderate rain showers", "Showers"],
    82: ["Violent rain showers", "Heavy showers"],
    85: ["Slight snow showers", "Snow showers"],
    86: ["Heavy snow showers", "Snow showers"],
    95: ["Thunderstorm", "Thunderstorm"],
    96: ["Thunderstorm with hail", "Storm + hail"],
    99: ["Severe thunderstorm with hail", "Severe storm"],
  };
  const [label, short] = m[code] ?? ["Unknown", "—"];
  return { label: isDay ? label : `${label} · night`, short };
}

export function isPrecipitating(code: number): boolean {
  return (
    (code >= 51 && code <= 67) || (code >= 71 && code <= 86) || (code >= 95 && code <= 99)
  );
}
