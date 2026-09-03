"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

type Quote = { bid: number; pctChange: number };
type Quotes = { USD: Quote | null; EUR: Quote | null };

// AwesomeAPI: free, no key required, CORS-enabled — widely used for BRL
// exchange rates. Refreshed periodically so the numbers stay current
// without a page reload.
const ENDPOINT = "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL";
const REFRESH_MS = 5 * 60 * 1000;

export function CurrencyTicker() {
  const [quotes, setQuotes] = useState<Quotes | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(ENDPOINT);
        const data = await res.json();
        if (cancelled) return;
        setQuotes({
          USD: data.USDBRL ? { bid: Number(data.USDBRL.bid), pctChange: Number(data.USDBRL.pctChange) } : null,
          EUR: data.EURBRL ? { bid: Number(data.EURBRL.bid), pctChange: Number(data.EURBRL.pctChange) } : null,
        });
      } catch {
        // Silently skip — the ticker just doesn't render this cycle.
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!quotes || (!quotes.USD && !quotes.EUR)) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {quotes.USD && <CurrencyItem label="Dólar" quote={quotes.USD} />}
      {quotes.EUR && <CurrencyItem label="Euro" quote={quotes.EUR} />}
    </div>
  );
}

function CurrencyItem({ label, quote }: { label: string; quote: Quote }) {
  const up = quote.pctChange >= 0;
  const color = up ? "#06D6A0" : "#ef4444";
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
      <span style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      {up ? <ArrowUp size={11} color={color} /> : <ArrowDown size={11} color={color} />}
      <span style={{ color, fontWeight: 700 }}>{quote.bid.toFixed(3).replace(".", ",")}</span>
    </span>
  );
}
