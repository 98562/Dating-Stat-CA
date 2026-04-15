# Architecture

## Route structure

- `/`
  - public landing page and primary calculator route
  - loads the full calculator experience directly so filters and results stay above the fold
  - keeps presets, methodology teaser, and FAQ content below the main tool inside collapsible sections
- `/calculator`
  - full calculator workspace
  - uses readable raw query params for the live editing flow
- `/s/[payload]`
  - compact share route
  - restores calculator state from a shorter versioned payload
  - falls back calmly if the payload is malformed or unsupported
- `/methodology`
  - static explanatory page for trust labels and pipeline logic
- `/sources`
  - dataset catalog with usage and limitations
- `/faq`
  - practical launch-facing questions
- `/about`
  - project philosophy and public-facing context
- `/privacy`
  - plain-language privacy page for launch
- `/terms`
  - plain-language public-web terms page
- `/opengraph-image`, `/twitter-image`, `/apple-icon`, `/icon.svg`, `/manifest.webmanifest`
  - publication-ready metadata and brand asset routes/files

## Product naming

- public product name
  - `Canada Dating Pool Calculator`
- metadata default title
  - `Canada Dating Pool Calculator`

This keeps the public identity clear for both people and crawlers without adding a second brand layer that is no longer used.

The crawler-friendly descriptive paragraph lives lower on the homepage in a subdued `About this tool` card, rather than being pushed into the hero.

## Launch mode

The initial publication intentionally hides some prepared features so the app feels clean and finished.

Launch-default settings live in [`config/launch.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/launch.ts).

Current launch defaults:

- ads off
- support CTA off
- optional analytics off
- optional advertising off
- consent UI off
- compare mode off
- experimental placeholder surfaces off

## Data flow

1. Route loads normalized dataset from [`lib/data/loaders.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/data/loaders.ts).
2. Route builds default manual assumptions from normalized metadata.
3. URL search params are decoded into calculator filters.
4. [`components/calculator/calculator-shell.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/calculator/calculator-shell.tsx) manages local interactive state and persists it back into the URL.
5. [`lib/calculator.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/calculator.ts) produces the final calculation result and step metadata.
6. Calculator UI reads that metadata to render cards, charts, trust labels, and the step log.

Sharing is a parallel layer on top of that:

1. Internal editing still uses readable query params on `/` and `/calculator`.
2. User-facing share actions build a compact payload under [`lib/share`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share).
3. `/s/[payload]` decodes that payload and restores the same calculator state.
4. `/s/[payload]` also generates crawler-visible metadata plus a matching OG image for that exact shared state.
5. `/s/[payload]/share-image` generates the portrait image used by download/native-share actions.
6. If decoding fails, the route renders a calm recovery state instead of crashing.
7. If an older state tries to go below the public minimum age, decoding clamps it back to 18+.

### Deployment dataset boundary

For deployment, the app reads the bundled normalized snapshot at [`data/normalized/calculator-dataset.json`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/data/normalized/calculator-dataset.json) rather than opening raw CSV files at runtime.

That snapshot is generated from the raw Statistics Canada extracts by [`scripts/generate-calculator-dataset.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/scripts/generate-calculator-dataset.ts), which calls the shared normalization path in [`lib/data/loaders.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/data/loaders.ts).

This keeps the live runtime compatible with serverless and Cloudflare Workers deployments, where direct runtime filesystem access to large raw source folders is not a safe assumption.

## Calculator engine boundaries

The engine is intentionally separate from the presentation layer.

Engine responsibilities:

- apply filter sequence
- determine shares
- classify each step as observed, estimated, or assumption
- carry citations and notes forward
- compute final pool, strictness, and comparison output

Important current step types:

- observed categorical union step
  - used for multi-select population-group logic
  - combines selected categories with OR semantics
- estimated categorical union step
  - used for drinking habits
  - unions selected survey buckets while preserving overlap handling for derived options such as "Avoids heavy drinking"
- estimated range union step
  - used for height
  - merges overlapping or adjacent acceptable ranges before estimating a single surviving share
- assumption share step
  - used for attractiveness and manual assumption sliders
  - never masquerades as official data

UI responsibilities:

- editing filters
- rendering result cards and charts
- exposing methodology copy and source notes
- showing empty-result and missing-dataset states
- reserving ad-slot layout when monetization is enabled later
- keeping the public tool inside its supported 18+ calculator boundary

Brand/metadata responsibilities:

- [`components/brand/site-brand.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/brand/site-brand.tsx)
  - reusable app wordmark and iconography
- [`components/brand/social-image.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/brand/social-image.tsx)
  - shared composition for generated social cards
- App metadata routes
  - handle browser/app icons, manifest output, and default OG/Twitter image generation
- [`config/seo.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/seo.ts)
  - central naming, default descriptions, and crawler-friendly supporting copy

This separation is what makes future dataset refreshes and new filter groups practical without rewriting the page structure.

## 18+ calculator boundary

The calculator is intentionally limited to age ranges 18 and above.

Boundary sources:

- [`config/product.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/product.ts)
  - authoritative minimum age and audience label
- [`components/calculator/filter-panel.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/calculator/filter-panel.tsx)
  - age UI starts at 18
- [`lib/filter-query.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/filter-query.ts)
  - readable URL parsing clamps old values to 18+
- [`lib/share/decodeState.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/decodeState.ts)
  - compact share restoration clamps old values to 18+

This means there is no teen mode, no under-18 preset path, and no mobile-only bypass.

## Test coverage

Math-focused regression checks live in [`tests/calculator-math.test.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/tests/calculator-math.test.ts).
Share-state regression checks live in [`tests/share-state.test.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/tests/share-state.test.ts).

These tests intentionally target the calculation engine rather than the UI layer. Current coverage focuses on:

- population-group OR-union behavior
- drinking-habit survey unions
- non-zero official category loading
- height threshold ordering and tail sanity
- custom height overlap merging
- assumption-step handling for looks

## Multi-select and range handling

Population group:

- category definitions live in [`config/filters/ethnicity.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/filters/ethnicity.ts)
- UI state stores selected keys
- the engine treats multi-select as a union, meaning "match any selected category"
- when the exact slice is supported by the official table, the step can remain `Observed`
- when partial age-band interpolation or omitted conditioning is required, the step degrades to `Estimated`

Height:

- presets and percentile anchors live in [`config/filters/height.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/filters/height.ts)
- internal state is canonical centimetres even when the UI is showing imperial labels
- selected preset ranges and custom ranges are normalized by [`normalizeRanges.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/calculation/utils/normalizeRanges.ts)
- overlap handling is centralized in [`mergeOverlappingRanges.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/calculation/utils/mergeOverlappingRanges.ts)
- the calculator estimates one union share for "matches any acceptable selected height range" to avoid double counting

Drinking habits:

- normalized category definitions live in [`config/filters/drinking.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/filters/drinking.ts)
- the backing survey distributions live in [`data/normalized/drinking-risk-cchs-2023.json`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/data/normalized/drinking-risk-cchs-2023.json)
- multi-select means "match any selected drinking category"
- derived options such as "Avoids heavy drinking" are expressed as unions of underlying mutually exclusive survey buckets
- the step is usually `Estimated` because the public table is survey-based and not published as a full geography-by-age-by-sex cross-tab for the active funnel
- underreporting caveats are shown intentionally because the source is self-reported

Language boundary:

- the app intentionally talks about drinking habits or alcohol use
- it does not use dependence labels such as "alcoholic"
- this module is about survey behavior, not diagnosis

Looks / attractiveness:

- preset definitions live in [`config/filters/looks.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/filters/looks.ts)
- this step is always `Assumption`
- it is intentionally outside the official-data pipeline

## Future ad integration

Ad placeholders are isolated under [`components/ads/ad-slot.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/ads/ad-slot.tsx).

The app also includes [`components/ads/ad-provider.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/ads/ad-provider.tsx) and [`lib/ads/get-ad-provider-config.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/ads/get-ad-provider-config.ts) as the future AdSense/provider seam.

Future real ad integration belongs there, not sprinkled across pages.

Recommended boundary:

- keep page-level placement decisions in route or shell components
- keep provider-specific rendering inside the ad component layer
- keep ad initialization disabled by default until monetization config and publisher IDs are intentionally supplied
- preserve reserved slot sizing to avoid layout shift
- preserve fallback UI when ads are disabled, blocked, or unfilled
- keep support CTA separate from ad slots so monetization remains legible and non-deceptive

## Privacy / consent layer

This app now includes a lightweight public-web privacy layer.

Key pieces:

- [`config/privacy.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/privacy.ts)
  - optional tracking flags, consent categories, and storage key
- [`lib/privacy/preferences.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/privacy/preferences.ts)
  - tiny local-storage read/write helpers for consent preferences
- [`components/layout/privacy-preferences-control.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/layout/privacy-preferences-control.tsx)
  - footer-linked preferences UI that can be re-enabled later if optional tracking categories go live

Design intent:

- keep the consent layer small
- keep necessary-only separate from optional analytics/advertising
- avoid initializing optional trackers before consent if those systems are later introduced
- keep the preferences UI hidden in the initial public launch when nothing optional is active

## Feature flags

Feature flags live in [`config/features.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/features.ts).

These currently gate:

- 18+ calculator boundary
- compare mode
- ad placeholders
- support CTA visibility
- optional analytics
- optional advertising
- consent UI
- province ranking placeholder
- manual assumptions visibility
- extra filter group placeholder

The launch config is the source of truth for which of these are intentionally visible in the initial publication.

## What remains in the codebase for later

- compare mode route is not implemented
- province ranking is flagged but not built
- extra demographic filter groups remain future work
- ad slots and provider seams remain available for later monetization work
- support/contact values still come from config and environment variables
- encounter-rate simulation is intentionally deferred and should remain a separate future layer rather than being mixed into the current population engine
- dynamic per-result OG images for `/s/[payload]` are still optional and should plug into the share route metadata/image layer rather than the calculator engine

## Compact sharing layer

Sharing logic is intentionally separate from calculator UI logic.

Key modules:

- [`lib/share/encodeState.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/encodeState.ts)
  - serializes the active filters into a compact, versioned payload
- [`lib/share/decodeState.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/decodeState.ts)
  - validates payload structure and restores filter state
- [`lib/share/buildSharePreview.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/buildSharePreview.ts)
  - central share-card content for summaries, metadata, and generated images
- [`lib/share/buildShareUrl.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/buildShareUrl.ts)
  - produces the short `/s/...` URL
- [`lib/share/buildShareImageUrl.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/buildShareImageUrl.ts)
  - builds the share-image and OG-image URLs for a compact payload
- [`lib/share/buildShareSummary.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/buildShareSummary.ts)
  - generates the short human-readable text used for `Copy summary` and native sharing
- [`lib/share/shareImage.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/shareImage.ts)
  - downloads or native-shares the generated share card image with fallback behavior
- [`components/share/share-actions.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/share/share-actions.tsx)
  - the reusable UI for `Share image`, `Download image`, `Copy summary`, and `Copy link`
- [`components/share/share-image-template.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/share/share-image-template.tsx)
  - shared visual template for landscape social previews and portrait mobile share images

Why this shape was chosen:

- shorter and cleaner than exposing the full raw query string
- no database or share-token persistence service required
- easy to version later
- keeps the readable internal URL-state system intact for live editing and debugging
- uses progressive enhancement for mobile image sharing instead of pretending the web can directly post to Instagram Stories

## Compatibility notes

The project manifest now targets Next.js 15 and React 19.

Page routes are written in a way that is compatible with Next.js 15 App Router expectations, including async route props and metadata helpers.

The repo also includes an OpenNext Cloudflare deployment path:

- [`open-next.config.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/open-next.config.ts)
- [`wrangler.jsonc`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/wrangler.jsonc)

If deploying on Cloudflare Workers, the build should use `npm run cf:build` so the OpenNext output is produced before `wrangler deploy`.

## Launch checklist

- review Privacy, Terms, FAQ, and About copy before publication
- verify ads, support CTA, analytics, consent UI, and compare mode are not visible unless intentionally enabled
- verify footer links work on desktop and mobile
- verify the support/legal pages remain readable on narrow mobile widths
- verify no placeholder or operator-facing text remains in the public UI
- verify deployment environments that use Workers or serverless runtimes are consuming the bundled normalized dataset rather than expecting raw CSV access at runtime
