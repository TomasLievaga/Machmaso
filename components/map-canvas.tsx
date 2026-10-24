"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { renderToStaticMarkup } from "react-dom/server";
import { LocateFixed } from "lucide-react";
import { ActionIcon } from "./icons";
import { names, type Listing, type Language } from "@/lib/data";
import { copy } from "@/lib/i18n";

type Props = {
  listings: Listing[];
  language: Language;
  onSelect: (listing: Listing) => void;
  onUnavailable: () => void;
};
export default function MapCanvas({
  listings,
  language,
  onSelect,
  onUnavailable,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const cluster = useRef<L.MarkerClusterGroup | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView([48.143, 11.568], 13);
    map.current = instance;
    L.control
      .zoom({
        position: "bottomright",
        zoomInTitle: language === "en" ? "Zoom in" : "Vergrößern",
        zoomOutTitle: language === "en" ? "Zoom out" : "Verkleinern",
      })
      .addTo(instance);
    const tiles = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      },
    ).addTo(instance);
    tiles.on("tileerror", () => {
      setFailed(true);
      onUnavailable();
    });
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 30,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (group) =>
        L.divIcon({
          html: `<span aria-label="${group.getChildCount()} ${language === "en" ? "actions. Zoom in to explore" : "Aktionen. Zum Entdecken vergrößern"}">${group.getChildCount()}</span>`,
          className: "action-cluster",
          iconSize: [43, 43],
        }),
    }).addTo(instance);
    cluster.current = group;
    const resize = new ResizeObserver(() => instance.invalidateSize());
    resize.observe(container.current);
    return () => {
      resize.disconnect();
      instance.remove();
      map.current = null;
      cluster.current = null;
    };
  }, [language, onUnavailable]);
  useEffect(() => {
    const group = cluster.current;
    if (!group) return;
    group.clearLayers();
    for (const listing of listings) {
      const label = `${names[language].intentions[listing.intention]}: ${listing.title}`;
      const icon = L.divIcon({
        html: renderToStaticMarkup(
          <ActionIcon category={listing.category} size={21} />,
        ),
        className: `action-marker ${listing.intention}`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });
      const marker = L.marker([listing.lat, listing.lng], {
        icon,
        title: label,
        keyboard: true,
      });
      const tooltip = document.createElement("span");
      tooltip.textContent = listing.title;
      marker.bindTooltip(tooltip, { direction: "top", offset: [0, -24] });
      marker.on("click", () => onSelect(listing));
      marker.on("add", () => {
        const element = marker.getElement();
        element?.setAttribute("aria-label", label);
        element?.setAttribute("role", "button");
      });
      group.addLayer(marker);
    }
  }, [listings, language, onSelect]);
  return (
    <div className="map-frame">
      <div
        className="map-canvas"
        ref={container}
        role="region"
        aria-label={copy[language].cityLabel}
      />
      <div className="map-city-label">
        <span className="live-dot" />
        {copy[language].city}
      </div>
      <button
        type="button"
        className="recenter"
        title={copy[language].zoom}
        aria-label={copy[language].zoom}
        onClick={() => map.current?.setView([48.143, 11.568], 13)}
      >
        <LocateFixed size={20} />
      </button>
      <div className="map-footnote">{copy[language].mapHint}</div>
      {failed && (
        <div className="map-warning" role="status">
          {copy[language].mapError}
        </div>
      )}
    </div>
  );
}
