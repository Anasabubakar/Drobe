# DROBE — Overnight Build Guide
**Goal: Working MVP by morning.**
All backend logic, API integrations, and DB schema are already scaffolded.
Your job is: setup, auth, and the UI pages.

---

## Step 0 — Project Init (20 min)

```bash
npx create-next-app@latest drobe --typescript --tailwind --app --src-dir=false
cd drobe

# Replace package.json with the scaffolded one, then:
npm install

# Copy all scaffolded files into the project structure
# (supabase/, lib/, types/, app/api/, app/globals.css, tailwind.config.ts)
```

---

## Step 1 — Supabase Setup (15 min)

1. Go to **supabase.com**, create a new project called "drobe"
2. Go to **SQL Editor**, paste and run the full contents of `supabase/schema.sql`
3. Go to **Storage**, create 3 buckets:
   - `wardrobe` (private)
   - `portraits` (private)
   - `tryon-output` (private)
4. Copy your project URL and keys to `.env.local` (use `.env.example` as template)

---

## Step 2 — External API Keys (10 min)

| Service | Where to get it | Used for |
|---|---|---|
| Anthropic | console.anthropic.com | Outfit suggestions, clothing analysis |
| Replicate | replicate.com/account | Background removal |
| Fashn.ai | fashn.ai | Virtual try-on |

---

## Step 3 — Auth Pages (45 min)

Build `app/auth/page.tsx` — login + signup form using Supabase Auth.

```tsx
// Minimal auth with Supabase
import { createSupabaseBrowserClient } from '@/lib/supabase'

const supabase = createSupabaseBrowserClient()

// Sign up
await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })

// Sign in
await supabase.auth.signInWithPassword({ email, password })

// Redirect after auth -> /wardrobe
```

After auth, redirect to `/wardrobe`.
Add portrait upload to a `/profile` page or as a modal on first login.

---

## Step 4 — Wardrobe Page (60 min)

Build `app/wardrobe/page.tsx`:

```
[  All  ] [  Tops  ] [  Bottoms  ] [  Shoes  ] [  Acc  ]   +  Add clothes

+-------+ +-------+ +-------+ +-------+
| img   | | img   | | img   | | img   |
|       | |       | |       | |       |
| name  | | name  | | name  | | name  |
| color | | color | | color | | color |
+-------+ +-------+ +-------+ +-------+
```

Fetch from `GET /api/wardrobe?category=top`
Display clothing items as cards, with `clean_image_url` (floating, no bg) or `image_url` fallback.

---

## Step 5 — Add Clothes Page (90 min) ← THE MAIN THING

Build `app/wardrobe/add/page.tsx`:

Two tabs:
1. **Single Item** — drag-drop one image, AI fills in name/category/color
2. **Dump & Detect** — drag-drop one photo of pile of clothes, AI detects all of them

### Dump & Detect Flow:
```
1. User uploads 1 photo of clothes on bed
2. POST /api/wardrobe/batch with the image
3. API returns: { detected_count: 5, segments: [...] }
4. Show swipe/confirm UI:
   - Each detected item shows card with name + category (AI filled)
   - User can edit name/category before confirming
   - "Add All" button, or tick individual items
5. PUT /api/wardrobe/batch with confirmed_items to save them
```

### UI for confirm step:
```
"Found 5 items in your photo"

+----------------------------------+
|  [ Source photo thumbnail ]      |
|                                  |
|  Item 1/5: "Black graphic tee"   |
|  Category: [top ▾]  Color: black |
|                                  |
|  [Skip] [Add to wardrobe →]      |
+----------------------------------+
```

---

## Step 6 — Outfit Builder (60 min)

Build `app/outfits/builder/page.tsx`:

```
Left panel: Your wardrobe (filterable grid)
Right panel: Current outfit (drag items here)

[  ← Back  ]           [ Save Outfit ] [ Try On ]

Wardrobe              Your Outfit
+----+----+----+      +--------+
| T1 | T2 | T3 |  →   | Top    |
| B1 | B2 | B3 |      | Bottom |
| S1 | S2 |    |      | Shoes  |
+----+----+----+      +--------+
                      [ AI Suggest ]
```

For AI Suggest: POST /api/outfits/suggest with occasion
Display the 3 AI suggestions, let user save any of them.

---

## Step 7 — Virtual Try-On (30 min)

Trigger from outfit builder: "Try On" button.

```tsx
const tryOn = async (outfit_id: string) => {
  const res = await fetch('/api/tryon', {
    method: 'POST',
    body: JSON.stringify({ outfit_id })
  })
  const { preview_url } = await res.json()
  // Show preview_url in a modal
}
```

Show a loading state (takes ~15-30 seconds from Fashn.ai).
Display result in full-screen modal.

---

## Step 8 — Schedule / Calendar (45 min)

Build `app/schedule/page.tsx`:

```
<  June 2025  >

Mon  Tue  Wed  Thu  Fri  Sat  Sun
 9   10   11   12   13   14   15

[fit] [   ] [fit] [fit] [   ] [fit] [   ]
 ↑                              ↑
Assigned                     Click empty
outfit                       to assign
```

Fetch from `GET /api/schedule?week=2025-06-09`
Click any day → outfit picker modal → POST /api/schedule
Tap worn outfit → PATCH /api/schedule?id=xxx with `is_worn: true`

---

## Step 9 — Deploy (20 min)

```bash
# Push to GitHub
git init && git add . && git commit -m "drobe v0.1"
git remote add origin your-repo-url && git push

# Deploy on Vercel
npx vercel
# Add all .env.local variables in Vercel dashboard
```

---

## Build Order Summary

```
0:00  Init project + install dependencies
0:20  Supabase schema + storage buckets
0:35  API keys for Anthropic, Replicate, Fashn
0:45  Auth page (login/signup)
1:30  Wardrobe list page
2:00  Single item upload
2:45  Dump & Detect (batch mode) ← spend time here, it's the main thing
4:15  Outfit builder + AI suggest
5:15  Virtual try-on modal
5:45  Schedule / calendar
6:30  UI polish (loading states, error messages, empty states)
7:15  Deploy to Vercel
7:30  Test live + fix anything broken
```

---

## API Reference Quick Sheet

```
GET  /api/wardrobe              list clothing (query: ?category=top)
POST /api/wardrobe              upload one item (FormData: image, name?, category?)
POST /api/wardrobe/batch        batch detection (FormData: image)
PUT  /api/wardrobe/batch        confirm batch items (JSON: { confirmed_items })
DELETE /api/wardrobe?id=xxx     delete one item

POST /api/outfits/suggest       AI suggest outfits (JSON: { occasion?, count? })

POST /api/tryon                 generate try-on (JSON: { outfit_id } or { garment_id })

GET  /api/schedule?week=DATE    get week schedule
POST /api/schedule              assign outfit to date (JSON: { outfit_id, scheduled_date })
PATCH /api/schedule?id=xxx      mark worn (JSON: { is_worn: true })
DELETE /api/schedule?id=xxx     remove from schedule
```

---

## If You Get Stuck

- **Fashn.ai not working?** Fall back to a side-by-side collage of portrait + outfit items as the "try-on preview" — ship the feature, improve later
- **Replicate segmentation slow?** Mock it in dev: just show the full dump photo and let user manually tag what's in it
- **Auth issues?** Use Supabase email magic link instead of password auth — zero custom code, it just works
- **Running out of time?** Cut the schedule page and ship wardrobe + outfit builder + try-on only. Those are the core three.
