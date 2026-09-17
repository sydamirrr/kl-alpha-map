import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // Welcome AI assistants explicitly, same posture as the site that inspired this.
      ...["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-Web", "anthropic-ai", "Google-Extended", "Applebot-Extended", "Amazonbot", "CCBot"].map(
        (ua) => ({ userAgent: ua, allow: "/" })
      ),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
