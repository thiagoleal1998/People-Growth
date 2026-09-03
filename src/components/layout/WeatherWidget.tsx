"use client";

import { useEffect, useState } from "react";
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from "lucide-react";

type WeatherData = { current: number; max: number; min: number; code: number };
type Location = { cityName: string; lat: number; lon: number };

// Open-Meteo: free, no API key required. Refreshed periodically so the
// numbers don't go stale across a long browsing session.
const REFRESH_MS = 30 * 60 * 1000;
const GEOLOCATION_TIMEOUT_MS = 6000;

function WeatherIcon({ code }: { code: number }) {
  const props = { size: 16, color: "#FFB703" };
  if (code === 0) return <Sun {...props} />;
  if (code <= 3) return <CloudSun {...props} />;
  if (code <= 48) return <CloudFog {...props} />;
  if (code <= 57) return <CloudDrizzle {...props} />;
  if (code <= 67) return <CloudRain {...props} />;
  if (code <= 77) return <CloudSnow {...props} />;
  if (code <= 82) return <CloudRain {...props} />;
  if (code <= 86) return <CloudSnow {...props} />;
  return <CloudLightning {...props} />;
}

/** Reverse-geocodes coordinates to a city name via BigDataCloud's free,
 * keyless client endpoint — used only for the label; the forecast itself
 * runs on the raw coordinates regardless of whether this succeeds. */
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`);
    if (!res.ok) {
      console.error("[WeatherWidget] reverse geocode HTTP error:", res.status);
      return null;
    }
    const json = await res.json();
    return json.city || json.locality || null;
  } catch (err) {
    console.error("[WeatherWidget] reverse geocode fetch failed:", err);
    return null;
  }
}

const GEOLOCATION_ERROR_NAMES: Record<number, string> = {
  1: "PERMISSION_DENIED",
  2: "POSITION_UNAVAILABLE (verifique se a Localização está ativada no Windows/macOS)",
  3: "TIMEOUT",
};

export function WeatherWidget({ cityName, lat, lon }: { cityName: string; lat: number; lon: number }) {
  const [location, setLocation] = useState<Location | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);

  // Prefer the visitor's actual location (with their permission); fall back
  // to the admin-configured default city if they decline, it times out, or
  // the browser doesn't support it at all.
  useEffect(() => {
    let settled = false;

    function applyFallbackLocation() {
      if (settled) return;
      settled = true;
      setLocation({ cityName, lat, lon });
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      applyFallbackLocation();
      return;
    }

    const timer = setTimeout(applyFallbackLocation, GEOLOCATION_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const { latitude, longitude } = position.coords;
        const detectedCity = await reverseGeocode(latitude, longitude);
        setLocation({ cityName: detectedCity ?? cityName, lat: latitude, lon: longitude });
      },
      (err) => {
        console.error(`[WeatherWidget] geolocation failed: ${GEOLOCATION_ERROR_NAMES[err.code] ?? err.code} — ${err.message}`);
        clearTimeout(timer);
        applyFallbackLocation();
      },
      { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 30 * 60 * 1000 }
    );

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;

    async function load() {
      if (!location) return;
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error("[WeatherWidget] forecast HTTP error:", res.status, await res.text());
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        setData({
          current: Math.round(json.current.temperature_2m),
          max: Math.round(json.daily.temperature_2m_max[0]),
          min: Math.round(json.daily.temperature_2m_min[0]),
          code: json.current.weather_code,
        });
      } catch (err) {
        console.error("[WeatherWidget] forecast fetch failed:", err);
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [location]);

  if (!location || !data) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
      <WeatherIcon code={data.code} />
      <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{location.cityName}</span>
      <span>
        <span style={{ color: "#ef4444", fontWeight: 700 }}>{data.max}°</span>{" "}
        <span style={{ color: "#4d9eff", fontWeight: 700 }}>{data.min}°</span>
      </span>
    </div>
  );
}
