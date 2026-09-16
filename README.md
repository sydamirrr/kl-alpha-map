# kl-alpha-map

A sourced, interactive map of the projects changing Kuala Lumpur and Selangor.
Inspired by the evidence discipline of the [Singapore Alpha Map](https://heynemo.ai/sg); independent project, own code and content.

## What it is

- One interactive map (MapLibre GL + free OpenFreeMap tiles) of Klang Valley development projects
- Categories: AI & data centres, rail & transit, urban skyline, water & flood
- Every project page carries: status, scale, why it matters, questions to follow, location precision, history, and sources with publication + access dates
- Honest about unknowns: unpinned records are labelled, precision notes are explicit

## Stack

- [Next.js](https://nextjs.org) (App Router, static generation per project)
- [MapLibre GL JS](https://maplibre.org) + [OpenFreeMap](https://openfreemap.org) free vector tiles
- [Tailwind CSS v4](https://tailwindcss.com)
- Data: one JSON file per project in `data/projects/` (the repo is the CMS)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Adding a project

1. Copy an existing JSON file in `data/projects/` (start from `google-elmina.json` for a fully pinned example)
2. Fill every evidence field. If a fact has no source, do not publish the fact
3. Add the import to `lib/projects.ts`
4. Open the project page locally and verify every link

## Data rules (non-negotiable)

- Every claim carries a source link, publication date, and access date
- Status / scale / location each get their own precision note
- Unverified coordinates stay unpinned (`"coordinates": null`) with an explanation
- `edition_reviewed` updates whenever a record is touched

## License

MIT for the code. Project data files are curated editorial content with cited sources; each source keeps its own license.
