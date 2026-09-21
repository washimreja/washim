/** Shared domain types for SkySense. */

export interface GeoPlace {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  population?: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  pressure: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
}

export interface HourlyPoint {
  time: string; // ISO
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
  humidity: number;
  cloudCover: number;
  isDay: boolean;
}

export interface DailyPoint {
  date: string; // ISO date
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationHours: number;
  precipitationProbability: number;
  windMax: number;
  windGustsMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  place: GeoPlace;
  timezone: string;
  utcOffsetSeconds: number;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  fetchedAt: number;
}

export type AlertSeverity = "info" | "moderate" | "severe";

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  window?: { start: string; end: string };
}

export interface ActivityConditions {
  tempC: number;
  apparentC: number;
  precipitationProb: number;
  windMax: number;
  uvIndexMax: number;
  cloudCoverPct: number;
}

export interface ActivityProfile {
  id: string;
  label: string;
  icon: string;
  /** Score the conditions from 0–100; higher is better. */
  score: (c: ActivityConditions) => number;
}

export interface ActivityRecommendation {
  activity: ActivityProfile;
  score: number;
  band: "great" | "good" | "fair" | "poor";
  reasons: string[];
}

export interface Insight {
  id: string;
  kind: "tip" | "warning" | "pattern";
  title: string;
  body: string;
  icon: string;
}

export interface ComfortPrefs {
  /** °C above which the user feels hot */
  heatC: number;
  /** °C below which the user feels cold */
  coldC: number;
  /** 0–100 tolerated rain likelihood before complaining */
  rainTolerance: number;
  /** 0–10 tolerated wind before complaining */
  windTolerance: number;
  /** 0–100 cloudiness the user considers "meh" */
  sunLove: number;
  /** preferred workout heart-rate zone, informational */
  intensity: "chill" | "steady" | "intense";
}

export interface Plan {
  id: string;
  title: string;
  note: string;
  when: string; // ISO datetime (or date) reference
  placeName: string;
  activity: string;
  createdAt: number;
  shared?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  memberSince: number;
  homePlace: GeoPlace | null;
  favorites: GeoPlace[];
  comfort: ComfortPrefs;
  activityWeights: Record<string, number>; // activityId -> 0..1 interest
  interactions: number;
}

export interface StoredUser {
  profile: UserProfile;
  /** Hashed in real life; demo keeps a derived digest so plaintext never persists. */
  passwordHash: string;
}

export interface PlanInteraction {
  planId: string;
  action: "view" | "share" | "save";
  at: number;
}
