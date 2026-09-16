export type CategoryKey = "datacentre" | "rail" | "urban" | "water";

export type ProjectStatus =
  | "operational"
  | "construction"
  | "upcoming"
  | "watchlist";

export interface Source {
  publisher: string;
  title: string;
  url: string;
  published?: string;
  accessed: string;
}

export interface HistoryEntry {
  date: string;
  event: string;
}

export interface ScaleFact {
  label: string;
  value: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
  precision: "site" | "area" | "corridor";
}

export interface Project {
  slug: string;
  name: string;
  category: CategoryKey;
  area: string;
  status: ProjectStatus;
  status_detail?: string;
  coordinates: Coordinates | null;
  summary: string;
  scale?: ScaleFact[];
  why_it_matters?: string;
  questions_to_follow?: string[];
  location_precision?: string;
  sources: Source[];
  history?: HistoryEntry[];
  edition_reviewed: string;
}

export const CATEGORIES: Record<
  CategoryKey,
  { label: string; color: string; description: string }
> = {
  datacentre: {
    label: "AI & data centres",
    color: "#0891b2",
    description: "Hyperscale data centres and cloud regions",
  },
  rail: {
    label: "Rail & transit",
    color: "#ea580c",
    description: "LRT, MRT, rail links and stormwater tunnels",
  },
  urban: {
    label: "Urban skyline",
    color: "#7c3aed",
    description: "Towers, districts and redevelopment",
  },
  water: {
    label: "Water & flood",
    color: "#0d9488",
    description: "Flood mitigation and water infrastructure",
  },
};

export const STATUS: Record<
  ProjectStatus,
  { label: string; chip: string }
> = {
  operational: {
    label: "Operational",
    chip: "bg-green-100 text-green-800 border-green-300",
  },
  construction: {
    label: "Construction",
    chip: "bg-amber-100 text-amber-800 border-amber-300",
  },
  upcoming: {
    label: "Upcoming",
    chip: "bg-blue-100 text-blue-800 border-blue-300",
  },
  watchlist: {
    label: "Watchlist",
    chip: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

import googleElmina from "@/data/projects/google-elmina.json";
import microsoftMalaysia from "@/data/projects/microsoft-malaysia.json";
import lrt3 from "@/data/projects/lrt3-shah-alam-line.json";
import mrt3 from "@/data/projects/mrt3-circle-line.json";
import ecrl from "@/data/projects/ecrl.json";
import merdeka118 from "@/data/projects/merdeka-118.json";
import trx from "@/data/projects/trx.json";
import smartTunnel from "@/data/projects/smart-tunnel.json";
import mrtKajangLine from "@/data/projects/mrt-kajang-line.json";
import mrtPutrajayaLine from "@/data/projects/mrt-putrajaya-line.json";
import kvdt2 from "@/data/projects/kvdt2.json";
import riverOfLife from "@/data/projects/river-of-life.json";
import mrcbBukitJalilDc from "@/data/projects/mrcb-bukit-jalil-dc.json";
import bandarMalaysia from "@/data/projects/bandar-malaysia.json";
import klLocalPlan2040 from "@/data/projects/kl-local-plan-2040.json";

export const projects: Project[] = [
  googleElmina,
  microsoftMalaysia,
  lrt3,
  mrt3,
  ecrl,
  merdeka118,
  trx,
  smartTunnel,
  mrtKajangLine,
  mrtPutrajayaLine,
  kvdt2,
  riverOfLife,
  mrcbBukitJalilDc,
  bandarMalaysia,
  klLocalPlan2040,
] as Project[];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function pinnedProjects(): Project[] {
  return projects.filter((p): p is Project & { coordinates: Coordinates } => p.coordinates !== null);
}
