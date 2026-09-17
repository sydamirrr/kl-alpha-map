"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type FilterSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  CATEGORIES,
  STATUS,
  type CategoryKey,
  type Project,
  type ProjectStatus,
} from "@/lib/projects";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const KL_CENTER: [number, number] = [101.6869, 3.139];
const STATUS_FILTERS: Array<"all" | ProjectStatus> = [
  "all",
  "operational",
  "construction",
  "upcoming",
  "watchlist",
];

interface Props {
  projects: Project[];
}

export default function MapExplorer({ projects }: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [visibleCats, setVisibleCats] = useState<Set<CategoryKey>>(
    new Set(Object.keys(CATEGORIES) as CategoryKey[])
  );
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [pitch3d, setPitch3d] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const pinned = useMemo(
    () => projects.filter((p) => p.coordinates !== null),
    [projects]
  );
  const unpinnedCount = projects.length - pinned.length;

  const listed = useMemo(
    () =>
      projects.filter(
        (p) =>
          visibleCats.has(p.category) &&
          (statusFilter === "all" || p.status === statusFilter) &&
          (normalizedQuery === "" ||
            p.name.toLowerCase().includes(normalizedQuery) ||
            p.area.toLowerCase().includes(normalizedQuery) ||
            p.summary.toLowerCase().includes(normalizedQuery))
      ),
    [projects, visibleCats, statusFilter, normalizedQuery]
  );

  // Initialize the map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: KL_CENTER,
      zoom: 10.2,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("error", (e) => {
      // Tiles unreachable: keep the list usable, surface a hint.
      if (!map.areTilesLoaded()) setMapFailed(true);
      console.warn("maplibre error:", e?.error?.message ?? e);
    });

    const featureCollection = {
      type: "FeatureCollection" as const,
      features: pinned.map((p) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [p.coordinates!.lng, p.coordinates!.lat],
        },
        properties: {
          slug: p.slug,
          name: p.name,
          category: p.category,
          status: p.status,
          area: p.area,
        },
      })),
    };

    map.on("load", () => {
      map.addSource("projects", {
        type: "geojson",
        data: featureCollection,
      });

      for (const key of Object.keys(CATEGORIES) as CategoryKey[]) {
        map.addLayer({
          id: `layer-${key}`,
          type: "circle",
          source: "projects",
          filter: ["==", ["get", "category"], key],
          paint: {
            "circle-color": CATEGORIES[key].color,
            "circle-radius": 7,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        });
      }

      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: (Object.keys(CATEGORIES) as CategoryKey[]).map(
            (k) => `layer-${k}`
          ),
        });
        if (features.length === 0) return;
        const f = features[0];
        const props = f.properties as {
          slug: string;
          name: string;
          area: string;
          status: string;
        };
        setSelectedSlug(props.slug);
        new maplibregl.Popup({ offset: 12 })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-family:inherit;min-width:200px">
               <div style="font-weight:600;margin-bottom:2px">${props.name}</div>
               <div style="font-size:12px;color:#475569">${props.area}</div>
               <div style="font-size:12px;margin-top:6px">
                 <a href="/project/${props.slug}">Open project page →</a>
               </div>
             </div>`
          )
          .addTo(map);
      });

      map.getCanvas().style.cursor = "pointer";
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned]);

  // Toggle category layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      for (const key of Object.keys(CATEGORIES) as CategoryKey[]) {
        map.setLayoutProperty(
          `layer-${key}`,
          "visibility",
          visibleCats.has(key) ? "visible" : "none"
        );
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [visibleCats]);

  // 3D toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ pitch: pitch3d ? 55 : 0, duration: 600 });
  }, [pitch3d]);

  // Show only search-matching markers (combined with category visibility)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const queryFilter: FilterSpecification | null =
        normalizedQuery === ""
          ? null
          : [
              "any",
              ["in", ["literal", normalizedQuery], ["downcase", ["get", "name"]]],
              ["in", ["literal", normalizedQuery], ["downcase", ["get", "area"]]],
              ["in", ["literal", normalizedQuery], ["downcase", ["get", "summary"]]],
            ];
      for (const key of Object.keys(CATEGORIES) as CategoryKey[]) {
        map.setFilter(`layer-${key}`, ["all", ["==", ["get", "category"], key], ...(queryFilter ? [queryFilter] : [])]);
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [normalizedQuery]);

  const flyTo = (p: Project) => {
    setSelectedSlug(p.slug);
    if (!p.coordinates) return;
    mapRef.current?.flyTo({
      center: [p.coordinates.lng, p.coordinates.lat],
      zoom: 13,
      duration: 1200,
    });
  };

  const toggleCat = (key: CategoryKey) => {
    setVisibleCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Map */}
      <div className="relative flex-1 min-h-[420px] lg:min-h-[640px] rounded-xl overflow-hidden border border-slate-200">
        <div ref={containerRef} className="absolute inset-0" />
        {mapFailed && (
          <div className="absolute top-3 left-3 z-10 rounded-md bg-white/95 border border-slate-200 px-3 py-2 text-xs text-slate-600 shadow">
            Some basemap detail is unavailable. You can still explore the
            project list.
          </div>
        )}
        <button
          onClick={() => setPitch3d((v) => !v)}
          className="absolute bottom-3 left-3 z-10 rounded-md bg-white/95 border border-slate-200 px-3 py-1.5 text-xs font-medium shadow hover:bg-white"
        >
          {pitch3d ? "2D view" : "3D view"}
        </button>
      </div>

      {/* Side panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* Category switches */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Categories
          </div>
          <div className="flex flex-col gap-2">
            {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
              const count = projects.filter((p) => p.category === key).length;
              const on = visibleCats.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleCat(key)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                    on
                      ? "border-slate-300 bg-slate-50"
                      : "border-slate-200 bg-white opacity-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: CATEGORIES[key].color }}
                    />
                    {CATEGORIES[key].label}
                  </span>
                  <span className="text-xs text-slate-500">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status filter */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Status
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  statusFilter === s
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {s === "all" ? "All" : STATUS[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Project list */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
            Places & projects
          </div>
          <div className="text-xs text-slate-500 mb-3">
            {listed.length} place{listed.length === 1 ? "" : "s"} match
            {unpinnedCount > 0 && ` + ${unpinnedCount} unpinned record${unpinnedCount === 1 ? "" : "s"}`}
          </div>
          <div className="relative mb-3">
            <label htmlFor="project-search" className="sr-only">
              Search projects
            </label>
            <input
              id="project-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              aria-label="Search projects by name, area, or summary"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-9 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
            {query !== "" && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                title="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
            {listed.map((p) => (
              <a
                key={p.slug}
                href={`/project/${p.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  flyTo(p);
                }}
                className={`rounded-lg border px-3 py-2.5 transition hover:border-slate-400 ${
                  selectedSlug === p.slug
                    ? "border-slate-900"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium leading-snug">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.area}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${STATUS[p.status].chip}`}
                  >
                    {STATUS[p.status].label}
                  </span>
                </div>
                {p.coordinates === null && (
                  <div className="mt-1.5 text-[11px] text-slate-400">
                    Unpinned: no confirmed public coordinates yet
                  </div>
                )}
              </a>
            ))}
            {listed.length === 0 && (
              <div className="text-sm text-slate-500 py-4 text-center">
                No projects match the current filters.
              </div>
            )}
          </div>
        </div>

        {/* Map key */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          <div className="font-semibold text-slate-600 mb-2">About</div>
          Source-backed locations, plans and works in progress around Kuala
          Lumpur and Selangor. Every project page lists its evidence. Basemap:
          OpenFreeMap · OpenMapTiles · OpenStreetMap contributors.
        </div>
      </div>
    </div>
  );
}
