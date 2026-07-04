# DeckeFlow

AI-assisted presentation builder for busy professionals. Turn a topic or a
page of notes into a client-ready, branded 6–10 slide deck — then edit,
reorder, preview, and export.

The core differentiator: **upload a template or style reference** and generated
decks follow its look and structure.

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS 3** design system — warm neutral palette, single rust accent,
  editorial typography. No gradients, blobs, or glassmorphism.
- Self-contained MVP: no external services required to run.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
# or
npm run build && npm start
```

## Architecture

```
src/
  app/
    page.tsx                          landing
    login/ · signup/                  mock auth (email session)
    dashboard/                        deck list + empty states
    templates/                        built-in library + upload flow
    settings/                         account
    new/                              create wizard (topic | content)
    presentations/[id]/edit/          editor (rail · canvas · inspector)
    presentations/[id]/preview/       present mode (keyboard nav)
    api/generate/route.ts             deck content engine  ← AI seam
    api/export/route.ts               export placeholder
  components/
    ui/         Button, Field, Modal, Misc, icons — reusable primitives
    layout/     AppShell + sidebar
    marketing/  landing + auth sections
    templates/  template cards + upload
    editor/     SlideRail, Inspector, ExportDialog
    deck/       SlideView — shared slide renderer
  lib/
    types.ts       domain entities
    store.tsx      React context + localStorage persistence (swappable)
    templates.ts   built-in templates + sample data
    generate.ts    deterministic content engine
    utils.ts
```

## MVP boundaries & extension points

Persistence is `localStorage` behind a store interface — the write path
(`commit`) and the `Db` shape are the contract a real backend would satisfy.
Two clearly-marked seams are ready for real integrations:

- **`/api/generate`** — runs a deterministic content engine today. Swap the
  engine body for an LLM call.
- **`/api/export`** — acknowledges an `ExportJob`. Plug a PDF/PPTX renderer in
  behind the same button.

Auth, generation, and export are intentionally mocked so the whole product is
navigable and believable without credentials or infrastructure.
