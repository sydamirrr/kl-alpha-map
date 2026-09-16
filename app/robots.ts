import type { MetadataRoute } from "next";

// Update this when the custom domain is bought (see issue #14).
const BASE = "https://kl-alpha-map.vercel.app";

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
    sitemap: `${BASE}/sitemap.xml`,
  };
}
