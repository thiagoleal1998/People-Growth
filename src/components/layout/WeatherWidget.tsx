"use client";

import { useEffect, useState } from "react";
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from "lucide-react";

type WeatherData = { current: number; max: number; min: number; code: number };

// Open-Meteo: free, no API key required. Refreshed periodically so the
// numbers don't go stale across a long browsing session.
const REFRESH_MS = 30 * 60 * 1000;

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

export function WeatherWidget({ cityName, lat, lon }: { cityName: string; lat: number; lon: number }) {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
        const res = await fetch(url);
        const json = await res.json();
        if (cancelled) return;
        setData({
          current: Math.round(json.current.temperature_2m),
          max: Math.round(json.daily.temperature_2m_max[0]),
          min: Math.round(json.daily.temperature_2m_min[0]),
          code: json.current.weather_code,
        });
      } catch {
        // Silently skip — the widget just doesn't render this cycle.
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [lat, lon]);

  if (!data) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
      <WeatherIcon code={data.code} />
      <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{cityName}</span>
      <span>
        <span style={{ color: "#ef4444", fontWeight: 700 }}>{data.max}°</span>{" "}
        <span style={{ color: "#4d9eff", fontWeight: 700 }}>{data.min}°</span>
      </span>
    </div>
  );
}
