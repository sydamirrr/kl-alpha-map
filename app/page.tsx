import MapExplorer from "@/components/MapExplorer";
import { projects } from "@/lib/projects";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function Home() {
  const pinned = projects.filter((p) => p.coordinates !== null).length;
  const unpinned = projects.length - pinned;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <header className="mb-6">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Klang Valley Alpha Map
          </h1>
          <div className="text-sm text-slate-500">
            {projects.length} places & projects · {pinned} pinned
            {unpinned > 0 && ` · ${unpinned} unpinned`}
          </div>
        </div>
        <p className="mt-2 text-slate-600 max-w-3xl">
          The projects changing Kuala Lumpur and Selangor, on one map: data
          centres, rail, water works and the skyline. Every claim is
          source-backed, dated, and honest about what remains unverified.
        </p>
      </header>

      <MapExplorer projects={projects} />

      <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          Evidence dates do not imply a live site inspection. Statuses reflect
          the cited sources on the date checked.
        </span>
        <a
          className="underline hover:text-slate-700"
          href="https://github.com/sydamirrr/kl-alpha-map"
        >
          GitHub
        </a>
      </footer>
    </main>
  );
}
