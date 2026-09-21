import { describeWeather } from "./weather";
import type { WeatherAlert, WeatherData } from "./types";

function next24hPlaceholders(): string {
  return "next 24 hours";
}

export function deriveAlerts(data: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const { current, daily, hourly } = data;

  // Storm risk
  const stormDay = daily.find((d) => d.weatherCode >= 95);
  if (stormDay || current.weatherCode >= 95) {
    const when = stormDay
      ? new Date(`${stormDay.date}T12:00:00`).toLocaleDateString([], { weekday: "long" })
      : "now";
    alerts.push({
      id: "storm",
      title: "Thunderstorm risk",
      description: `Convection expected ${when}. Move outdoor plans indoors or under cover; lightning and gusty outflow winds possible.`,
      severity: "severe",
      window: stormDay ? { start: `${stormDay.date}T00:00`, end: `${stormDay.date}T23:59` } : undefined,
    });
  }

  // High gusts
  const gusty = daily.filter((d) => d.windGustsMax >= 55).slice(0, 2);
  if (gusty.length) {
    alerts.push({
      id: "wind",
      title: "Strong gusts ahead",
      description: `Gusts up to ${Math.round(gusty[0].windGustsMax)} km/h ${next24hPlaceholders()}. Secure loose objects; expect choppy conditions for cycling, drones and small craft.`,
      severity: gusty[0].windGustsMax >= 75 ? "severe" : "moderate",
    });
  }

  // Frost / freeze
  const frost = daily.find((d) => d.tempMin <= 0);
  if (frost) {
    alerts.push({
      id: "frost",
      title: "Frost likely",
      description: `Overnight low of ${Math.round(frost.tempMin)}°C on ${new Date(`${frost.date}T12:00:00`).toLocaleDateString([], { weekday: "long" })}. Cover plants, watch for icy patches on early commutes.`,
      severity: "moderate",
    });
  }

  // Heat
  const hot = daily.find((d) => d.tempMax >= 32);
  if (hot) {
    alerts.push({
      id: "heat",
      title: "Heat advisory",
      description: `High of ${Math.round(hot.tempMax)}°C ${hot.tempMax >= 38 ? "— dangerous heat. " : ""}Hydrate, seek shade 11:00–16:00, and shift workouts to early morning.`,
      severity: hot.tempMax >= 38 ? "severe" : "moderate",
    });
  }

  // UV
  const uvMax = Math.max(...daily.map((d) => d.uvIndexMax));
  if (uvMax >= 8) {
    alerts.push({
      id: "uv",
      title: "Very high UV index",
      description: `UV peaks near ${Math.round(uvMax)}. Sunscreen every 2 hours, hat and sunglasses recommended between 10:00 and 16:00.`,
      severity: "moderate",
    });
  }

  // Washout
  const washout = daily.find((d) => d.precipitationSum >= 15 || d.precipitationProbability >= 75);
  if (washout) {
    const { short } = describeWeather(washout.weatherCode);
    alerts.push({
      id: "rain",
      title: "Washout day",
      description: `${Math.round(washout.precipitationSum)} mm expected with ~${washout.precipitationProbability}% probability (${short}). Great day to move errands indoors.`,
      severity: "moderate",
    });
  }

  // Dry window in the next 48h — good news alert
  const nowIdx = hourly.findIndex((h) => new Date(h.time).getTime() >= Date.now() - 3600_000);
  let dryRun = 0;
  for (let i = Math.max(0, nowIdx); i < Math.min(hourly.length, Math.max(0, nowIdx) + 48); i++) {
    const h = hourly[i];
    if (h.precipitationProbability <= 30) dryRun++;
    else break;
  }
  if (dryRun >= 10) {
    alerts.push({
      id: "dry-window",
      title: "Dry window open",
      description: `~${Math.round(dryRun)} hours of dry weather ahead. Perfect for errands, laundry, or that walk you keep postponing.`,
      severity: "info",
    });
  }

  return alerts;
}
