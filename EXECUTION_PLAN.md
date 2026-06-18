# Drobe — Execution Plan

_Owner: Abdulbasit · Type: Web app (mobile-responsive) · Stack baseline: Next.js 16, React 19, Supabase, Tailwind_

## Decisions (locked 2026-06-18)
- **AI provider:** Keep **NVIDIA** (`lib/nvidia.ts`) for clothing analysis + outfit suggestions. PRD said OpenAI; we are not switching. Anthropic SDK stays unused for now.
- **Scope:** **Core first, then extras.** Get the PRD core working & verified, then layer Virtual Try-On (Fashn.ai) + Schedule once paid keys are provided.

## Reality check
This is **not greenfield** — a prior session scaffolded and deployed the full app. Pages, API routes, and `schema.sql` already exist. Supabase + NVIDIA keys are configured; Replicate (bg removal) and Fashn.ai (try-on) keys are still placeholders. The build compiles per git history but the end-to-end flow has never been verified.

---

## Phase 0 — Verify & stabilize  (verified 2026-06-18)
- [x] `npm run build` passes (clean compile + TS + 19 pages)
- [x] Dev server runs (port 3100); landing, `/auth`, `/dashboard` render on-brand
- [x] Auth works end-to-end (login → session → dashboard); pages render with proper empty states
- [x] Storage buckets created (public): `wardrobe`, `portraits`, `tryon-output`
- [ ] **BLOCKER — `schema.sql` is NOT applied.** All 5 tables return PostgREST "schema cache" errors (verified via service + anon). `/api/wardrobe` and `/api/outfits` 500; wardrobe & outfits pages show "Failed to load." **User must run `supabase/schema.sql` in the Supabase SQL Editor** (the connected Supabase MCP is a different account, so I can't apply it). After applying, run `notify pgrst, 'reload schema';` if the cache lags.
- [x] **Fixed: NVIDIA vision was broken.** `kimi-k2.6` is text-only and silently dropped images (23 prompt tokens; mock/hallucinated tags). Switched image analysis to `meta/llama-3.2-90b-vision-instruct` (verified: 1625 tokens, correct garment ID); kept kimi for text suggestions; hardened JSON parsing against ```json fences. See `lib/nvidia.ts`.
- [ ] After schema applied: walk the full loop (upload → AI tag → wardrobe → suggest → save → mark worn → insights)

### Known issues to track
- Background removal (Replicate) + try-on (Fashn) keys are placeholders → Phase 3.
- Buckets are **public** (matches `getPublicUrl` code) — harden to private + signed URLs in Phase 2.
- Lockfile workspace-root warning — set `turbopack.root` in `next.config.js`.
- Test user seeded for verification: `drobe-tester@example.com`.

## Phase 1 — Core MVP solid (the PRD heart)
- [ ] Auth + onboarding (signup/login/reset, portrait upload, redirect to `/wardrobe`)
- [ ] Wardrobe grid: category/color filters, empty state, clean-image fallback
- [ ] Single-item add: upload → NVIDIA tags name/category/color → bg-removed image
- [ ] Outfit builder + AI suggest (occasion-aware, avoids recently worn)
- [ ] Wear tracking: mark worn, last-worn date, frequency
- [ ] Insights dashboard: most/least/unused items, distribution, history
- [ ] Favorites (items + outfits)
- [ ] **KPI guardrail:** recommendation returns in <10s

## Phase 2 — Brand & UX polish
- [ ] Apply brand palette exactly: crimson `#E75A66`, pink `#F26E80`, accent `#FCA99A`, charcoal `#333333`
- [ ] Geometric sans typography; "clothes are the hero" / negative-space layout
- [ ] Reconcile logo color (asset is `#F45F5F`) with brand crimson
- [ ] Loading / empty / error states everywhere; mobile-first responsiveness pass

## Phase 3 — Ambition layer (needs paid keys)
- [ ] Replicate key → real background removal
- [ ] "Dump & Detect" batch upload (one photo → multiple items → confirm UI)
- [ ] Fashn.ai key → Virtual Try-On modal (with graceful fallback collage)
- [ ] Schedule / calendar (assign outfits to dates, mark worn)

## Phase 4 — Ship
- [ ] Redeploy to Vercel, sync env vars, smoke-test live

---

## Working notes
- App root: `C:\Users\DELL\Downloads\Drobe`
- Source docs: `Drobe PRD.pdf`, `Drobe_Brand_Identity.pdf` (extracted to `.txt` in `Downloads/`)
- Original overnight guide: `SPRINT.md`; progress tracker: `todo.md`
- API surface: see "API Reference Quick Sheet" in `SPRINT.md`
