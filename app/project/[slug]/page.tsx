import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, STATUS, getProject, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.name} | Klang Valley Alpha Map`,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const cat = CATEGORIES[project.category];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <a
        href="/"
        className="text-sm text-slate-500 hover:text-slate-800"
      >
        ← All projects
      </a>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className="rounded-full px-2.5 py-1 font-medium text-white"
            style={{ backgroundColor: cat.color }}
          >
            {cat.label}
          </span>
          <span className="text-slate-500 uppercase tracking-wide">
            {project.area}
          </span>
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
          {project.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS[project.status].chip}`}
          >
            {STATUS[project.status].label}
          </span>
          {project.status_detail && (
            <span className="text-slate-500">{project.status_detail}</span>
          )}
        </div>
      </header>

      <p className="mt-5 text-lg leading-relaxed text-slate-700">
        {project.summary}
      </p>

      {project.scale && project.scale.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Status & scale
          </h2>
          <dl className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {project.scale.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <dt className="text-xs text-slate-500">{s.label}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {project.why_it_matters && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Why it matters
          </h2>
          <p className="mt-2 text-slate-700 leading-relaxed">
            {project.why_it_matters}
          </p>
        </section>
      )}

      {project.questions_to_follow && project.questions_to_follow.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Questions to follow
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Research prompts, not assertions of future events.
          </p>
          <ul className="mt-2 space-y-2">
            {project.questions_to_follow.map((q) => (
              <li
                key={q}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                {q}
            </li>
            ))}
          </ul>
        </section>
      )}

      {project.location_precision && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Location precision
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {project.location_precision}
          </p>
          {project.coordinates && (
            <p className="mt-1 text-xs text-slate-400">
              Marker precision: {project.coordinates.precision}.
            </p>
          )}
        </section>
      )}

      {project.history && project.history.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recorded history
          </h2>
          <ul className="mt-2 space-y-2 border-l-2 border-slate-200 pl-4">
            {project.history.map((h) => (
              <li key={h.date + h.event} className="text-sm">
                <span className="font-medium text-slate-900">{h.date}</span>{" "}
                <span className="text-slate-600">— {h.event}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Evidence & sources
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          The linked source supports the reported stage. Targets remain subject
          to change.
        </p>
        <ul className="mt-3 space-y-2">
          {project.sources.map((s) => (
            <li
              key={s.url}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-900 hover:underline"
              >
                {s.title} ↗
              </a>
              <div className="text-xs text-slate-500 mt-1">
                {s.publisher}
                {s.published && ` · published ${s.published}`}
                {` · accessed ${s.accessed}`}
              </div>
                </li>
          ))}
        </ul>
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
        Edition reviewed {project.edition_reviewed}. Evidence dates do not
        imply a live site inspection.
      </footer>
    </main>
  );
}
