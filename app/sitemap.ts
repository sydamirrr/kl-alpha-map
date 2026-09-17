import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...projects.map((p) => ({
      url: `${SITE_URL}/project/${p.slug}`,
      lastModified: new Date(p.edition_reviewed),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
