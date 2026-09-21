import { useCallback, useEffect, useState } from "react";
import { fetchWeather } from "@/lib/weather";
import type { GeoPlace, WeatherData } from "@/lib/types";

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const cache = new Map<string, WeatherData>();

export function useWeather(place: GeoPlace | null): WeatherState {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const key = place ? `${place.latitude},${place.longitude}` : "";

  useEffect(() => {
    if (!place) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const cached = cache.get(key);
    if (cached && Date.now() - cached.fetchedAt < 10 * 60_000) {
      setData(cached);
      setLoading(false);
      return;
    }

    fetchWeather(place)
      .then((d) => {
        if (cancelled) return;
        cache.set(key, d);
        setData(d);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load weather");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [place, key, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, refresh };
}
