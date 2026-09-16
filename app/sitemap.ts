import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";

const BASE = "https://klalphamap.com"; // TODO: replace with the real domain once bought

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...projects.map((p) => ({
      url: `${BASE}/project/${p.slug}`,
      lastModified: new Date(p.edition_reviewed),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
