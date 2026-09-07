import { CurrencyTicker } from "./CurrencyTicker";
import { WeatherWidget } from "./WeatherWidget";
import { SiteSearchBar } from "./SiteSearchBar";

export function UtilityBar({ cityName, lat, lon }: { cityName: string; lat: number; lon: number }) {
  return (
    <div
      className="utility-bar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 51,
        height: "2.25rem",
        backgroundColor: "#0a1520",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container-xl" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%", gap: "1.5rem" }}>
        <div className="utility-bar-ticker" style={{ display: "flex", alignItems: "center", gap: "1.5rem", overflowX: "auto" }}>
          <CurrencyTicker />
          <WeatherWidget cityName={cityName} lat={lat} lon={lon} />
        </div>
        <SiteSearchBar />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .utility-bar { display: none; }
        }
        /* At medium widths the ticker (currency + date + weather) can run
           longer than the space left by the search bar — scrolling it
           instead of the "overflow: hidden" this replaced means the tail
           end (the year, most recently) is still reachable rather than
           silently clipped, same treatment as the mobile category nav. */
        .utility-bar-ticker { scrollbar-width: none; }
        .utility-bar-ticker::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
