# Canada Dating Pool Calculator

A public-facing Next.js web app that estimates how many people in Canada statistically match a chosen filter stack using official Statistics Canada data and explicit methodology labels.

The calculator supports age ranges 18 and above only. The selectable age floor is hard-set to 18 across the UI, readable URL state, and compact shared links.

The app preserves three trust states throughout the funnel:

- `Observed`: directly supported by an official published cross-tab
- `Estimated`: combined from compatible official distributions when the exact public combination is unavailable
- `Assumption`: a user-entered manual probability modifier

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Recharts
- shadcn-style UI primitives
- Local normalized dataset files under `data/`
- Vercel-friendly static/server rendering mix

## Route structure

- `/`
  - home page and primary calculator experience in one route, with the full filter/results workflow first and supporting explainers tucked lower down in collapsible sections
- `/calculator`
  - full calculator workspace using the readable internal query-string state
- `/s/[payload]`
  - compact share route that restores calculator state from a shorter versioned payload
- `/methodology`
- `/sources`
- `/faq`
- `/about`
- `/privacy`
- `/terms`

## App structure

```text
app/
components/
  ads/
  brand/
  calculator/
  content/
  layout/
  share/
  ui/
config/
  launch.ts
  legal.ts
  monetization.ts
  privacy.ts
  product.ts
  seo.ts
content/
data/
  normalized/
  raw/
lib/
  ads/
  data/
  privacy/
  seo/
  share/
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
npm run lint
npm run build
npm run test:unit
```

Math regression tests live in [`tests/calculator-math.test.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/tests/calculator-math.test.ts).
Share-state regression tests live in [`tests/share-state.test.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/tests/share-state.test.ts).

They are designed to catch the kinds of calculator regressions that are easy to miss visually, including:

- population-group multi-select collapsing to zero
- broken category unions
- height threshold tails becoming unrealistically impossible
- overlapping custom height ranges being double-counted
- looks remaining an explicit assumption step

## Deployment

This app is structured to deploy cleanly on Vercel or Cloudflare Workers.

Recommended environment variable:

- `NEXT_PUBLIC_SITE_URL`
  - Example: `https://datingpool.ca`
  - Used for canonical URLs, Open Graph metadata, sitemap, and robots output
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
  - Optional future AdSense publisher/client ID
  - The app does not initialize ad scripts unless ads are explicitly enabled and a client ID is present
- `NEXT_PUBLIC_SUPPORT_URL`
  - Optional support / feedback link shown in the footer and About page
- `NEXT_PUBLIC_PRIVACY_EMAIL`
  - Optional privacy contact email for the Privacy page and preferences control
- `NEXT_PUBLIC_GOVERNING_LAW`
  - Optional plain-language governing-law label for final terms review

Deployment flow:

1. Push the repo to GitHub or another supported Git provider.
2. Import the project into Vercel.
3. Set `NEXT_PUBLIC_SITE_URL` in the Vercel project settings if you need to override the default `https://datingpool.ca`.
4. Deploy.

No backend, auth, or database is required for the current version.

### Cloudflare Workers

This repo includes an OpenNext Cloudflare adapter setup:

- [`open-next.config.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/open-next.config.ts)
- [`wrangler.jsonc`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/wrangler.jsonc)

Important Cloudflare build settings:

- install command
  - `npm clean-install --progress=false`
- build command
  - `npm run cf:build`
- deploy command
  - `npx wrangler deploy`

Why the dataset now works on Cloudflare:

- the deployed app no longer tries to read raw CSV files from the filesystem at runtime
- instead, the loader imports the committed normalized snapshot at [`data/normalized/calculator-dataset.json`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/data/normalized/calculator-dataset.json)
- that snapshot is generated ahead of time by [`scripts/generate-calculator-dataset.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/scripts/generate-calculator-dataset.ts)

If raw source tables change, regenerate the bundled deployment snapshot with:

```bash
npm run data:generate
```

## Launch mode

The initial public release intentionally keeps a few prepared features turned off so the site feels complete rather than half-exposed.

Launch-default behavior:

- ads are off
- support CTA is off unless you intentionally enable it
- optional analytics are off
- optional advertising is off
- consent/preferences UI is off because there is nothing optional to configure at launch
- scenario comparison mode is off

The central launch switchboard lives in [`config/launch.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/launch.ts).

## Data and calculation model

The calculator engine lives in [`lib/calculator.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/calculator.ts).

The loader and normalization pipeline live in [`lib/data/loaders.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/data/loaders.ts).

Every calculation step carries:

- label
- denominator
- share
- prior population
- remaining population
- source type
- citation
- explanation

The UI reads that metadata; it does not hardcode the funnel logic itself.

## Sharing

The app now uses two URL layers on purpose:

- internal state persistence
  - readable raw query params on `/` and `/calculator`
  - useful while editing, debugging, and moving between the homepage and the full calculator
- user-facing sharing
  - compact links on `/s/[payload]`
  - generated from a versioned compact share payload instead of the full raw query string

Sharing modules live under [`lib/share`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share).

Current pieces:

- [`encodeState.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/encodeState.ts)
  - builds a compact, versioned payload from calculator filters
- [`decodeState.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/decodeState.ts)
  - restores filters and falls back safely on malformed or unsupported payloads
- [`buildShareUrl.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/buildShareUrl.ts)
  - returns the clean `/s/...` share link
- [`buildShareSummary.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/buildShareSummary.ts)
  - creates the short human-readable summary used by copy/share actions

The reusable UI lives in [`components/share/share-actions.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/share/share-actions.tsx).

User-facing share actions:

- `Share image`
  - on supported browsers/devices, generates the share-card image client-side and opens the native share sheet with image + text + compact link
  - whether Instagram or Stories appears is up to the device/browser share sheet, not the web app
- `Download image`
  - downloads a client-generated portrait share card image
  - fallback when native file sharing is unavailable
- `Copy link`
  - copies the compact `/s/...` link only
- `Copy summary`
  - copies a short result summary plus the compact link

Why this approach was chosen:

- shorter and cleaner than exposing every raw filter param
- no token database or persistence service required
- stable and versionable
- still keeps the readable raw query-string flow for live editing and internal navigation
- lets supported mobile browsers share a real image file without pretending the web can directly post to Instagram Stories

Shared-state safety note:

- older or malformed shared states that contain under-18 values are clamped back to the 18+ product minimum instead of crashing
- the compact share route restores state faithfully, but still respects the calculator's 18+ range boundary

Share-image and social-preview routes:

- [`app/s/[payload]/opengraph-image.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/app/s/%5Bpayload%5D/opengraph-image.tsx)
  - generates the server-side landscape preview used by link scrapers and social cards
- [`app/s/[payload]/share-image/route.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/app/s/%5Bpayload%5D/share-image/route.tsx)
  - keeps a server-side portrait image path available for shared-result URLs, but the live app no longer depends on it for ordinary mobile sharing
- [`lib/share/shareImage.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/share/shareImage.ts)
  - handles client-side image generation, download, and native image sharing with graceful fallback

Limitations to keep in mind:

- web sharing can open the system share sheet, but cannot guarantee that Instagram Stories or any other destination will be available
- scrapers read server-generated metadata, so the share route now sets its OG/Twitter image server-side instead of relying on client rendering

## Brand assets and metadata

The app now includes a small publication-ready asset layer instead of relying on missing or placeholder public files.

Naming structure:

- public product name
  - `Canada Dating Pool Calculator`
- default metadata title
  - `Canada Dating Pool Calculator`

Key pieces:

- [`app/icon.svg`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/app/icon.svg)
  - main browser/app icon
- [`app/apple-icon.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/app/apple-icon.tsx)
  - Apple touch icon route
- [`app/opengraph-image.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/app/opengraph-image.tsx)
  - default Open Graph image
- [`app/twitter-image.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/app/twitter-image.tsx)
  - default Twitter/X summary image
- [`app/manifest.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/app/manifest.ts)
  - web app manifest
- [`components/brand/site-brand.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/brand/site-brand.tsx)
  - reusable wordmark and mark used in header, footer, and share surfaces
- [`components/brand/social-image.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/brand/social-image.tsx)
  - shared layout used by generated social images

This keeps branding and metadata assets inside the App Router instead of depending on a separate `public/` placeholder layer.

Crawler-friendly descriptive copy lives in a low-emphasis `About this tool` card on the homepage instead of in the hero. That keeps the page understandable to crawlers without making the top of the page feel written for search engines.

New in this iteration:

- `Population group` supports multi-select with OR logic.
  Selecting more than one category means "match any selected official category", not all of them at once.
- `Drinking habits` supports survey-based multi-select with OR logic.
  The app normalizes official weekly alcohol-risk categories into cleaner UI options and unions the selected source buckets.
- `Height` supports multiple acceptable presets and custom ranges.
  All selected ranges are normalized into centimetres, overlapping or adjacent ranges are merged, and the union is estimated once to avoid double counting.
- `Looks / attractiveness` is assumption-only.
  It is always treated as user-supplied subjectivity rather than an official Canadian dataset.

Each step can also carry:

- note
- derivation
- selected values
- confidence level

## Updating datasets later

Raw starter files live in [`data/raw`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/data/raw).

Normalized metadata lives in [`data/normalized`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/data/normalized).

Update flow:

1. Replace the relevant raw Statistics Canada CSV extracts in `data/raw`.
2. Update `data/normalized/latest-population-estimates.json` if the live denominator changes.
3. Adjust label mapping in [`lib/data/loaders.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/data/loaders.ts) if StatCan changes field names or category labels.
4. Run `npm run data:generate` to refresh the bundled deployment dataset.
5. Re-run `npm run build`.
6. Review methodology copy if the new tables change conditioning limits or reference years.

For the population-group filter specifically:

1. Replace the raw `98100351` Statistics Canada extract in `data/raw`.
2. Keep category mapping centralized in [`config/filters/ethnicity.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/filters/ethnicity.ts).
3. Verify that category labels still map cleanly before trusting multi-select unions.

For height:

1. Update percentile anchors in [`config/filters/height.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/filters/height.ts) if a newer official source is adopted.
2. Keep the range math in [`lib/calculation/utils/normalizeRanges.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/calculation/utils/normalizeRanges.ts) and [`lib/calculation/utils/mergeOverlappingRanges.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/calculation/utils/mergeOverlappingRanges.ts), not in UI components.

For drinking habits:

1. Update the survey mapping in [`config/filters/drinking.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/filters/drinking.ts) if the public table changes or a better official source is adopted.
2. Keep the normalized survey distributions in [`data/normalized/drinking-risk-cchs-2023.json`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/data/normalized/drinking-risk-cchs-2023.json).
3. Remember that these are survey-based alcohol-use estimates for adults 18+ and may underreport true consumption.

## Feature flags

Feature flags live in [`config/features.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/features.ts).

Current flags:

- `adultOnly`
- `compareMode`
- `adSlotsEnabled`
- `supportEnabled`
- `analyticsEnabled`
- `advertisingEnabled`
- `consentUiEnabled`
- `provinceRankingEnabled`
- `manualAssumptionsEnabled`
- `extraFilterGroupsEnabled`

These are simple in-code flags for now. They can later move to environment variables or remote config if needed.

Supporting config modules:

- [`config/launch.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/launch.ts)
  - initial-publication switches for ads, support, analytics, consent UI, compare mode, and experimental surfaces
- [`config/product.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/product.ts)
  - product-level boundaries such as the calculator's 18+ minimum age
- [`config/seo.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/seo.ts)
  - central product naming, default metadata descriptions, and the subdued crawler-friendly homepage paragraph
- [`config/privacy.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/privacy.ts)
  - consent categories, storage key, and optional tracking flags
- [`config/monetization.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/monetization.ts)
  - separation between ad slots and support CTA behavior, plus the future AdSense config seam
- [`config/legal.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/legal.ts)
  - operator-facing support/contact settings for public pages

## Privacy and consent

Privacy/support content lives on:

- [`app/privacy/page.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/app/privacy/page.tsx)
- [`app/terms/page.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/app/terms/page.tsx)
- [`app/about/page.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/app/about/page.tsx)

The lightweight consent/preferences scaffold lives in:

- [`components/layout/privacy-preferences-control.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/layout/privacy-preferences-control.tsx)
- [`lib/privacy/preferences.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/privacy/preferences.ts)

Current behavior:

- necessary preferences stay on
- optional analytics and advertising stay off unless explicitly enabled and consented to
- the consent UI is hidden in the initial public launch because there are no optional tracking categories active
- consent choices are stored in one local browser record only when that preferences layer is enabled, using the key from `config/privacy.ts`
- no optional analytics or ad scripts are initialized by default in this build

## Ad placeholders

Reusable placeholder components live in [`components/ads/ad-slot.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/ads/ad-slot.tsx).
The future provider seam lives in [`components/ads/ad-provider.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/ads/ad-provider.tsx) and [`lib/ads/get-ad-provider-config.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/lib/ads/get-ad-provider-config.ts).

Current placements include:

- top slot
- inline slot
- wide-screen sidebar slot
- footer slot

No real ad SDK is integrated in this version.
Ads are disabled by default until you intentionally enable them in [`config/monetization.ts`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/config/monetization.ts) and provide a valid AdSense client ID.

For the initial public launch, ad slots are not shown in the UI when ads are off.

Support CTA is intentionally separate from ad inventory:

- support belongs in footer/about/support surfaces
- reserved ad slots remain clearly labeled placements
- the app should not mix support asks into ad containers

## Where real ad code should later plug in

Swap or wrap the placeholder components in [`components/ads/ad-slot.tsx`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/components/ads/ad-slot.tsx).

Recommended future approach:

1. Keep the current slot API and reserved dimensions.
2. Add a provider-specific renderer inside the slot component.
3. Keep fallback UI for empty fill or ad-disabled states.
4. Avoid adding intrusive mobile placements that violate the current layout rules.

## Trust model for the new filters

- `Population group`
  - `Observed` when the selected slice is directly supported by the official geography + age + sex table
  - `Estimated` when the app has to interpolate across partial age-band cuts or omit conditioning dimensions
- `Height`
  - usually `Estimated`
  - built from official Canadian measured-height percentiles, not the main census cross-tab pipeline
- `Drinking habits`
  - usually `Estimated`
  - built from Canadian health-survey alcohol-use distributions rather than census cross-tabs
  - includes an underreporting caveat because the source is self-reported
- `Looks / attractiveness`
  - always `Assumption`
  - never sourced from official demographic data

## Deferred work

- encounter-rate or simulation-style modeling is intentionally not part of the current engine
- compare mode remains feature-flagged rather than fully built
- future filter groups such as religion, immigration background, and ethnocultural expansions still need dedicated official-source mappings
- alcohol dependence or diagnostic language is intentionally excluded; this feature is about reported drinking habits, not clinical diagnosis
- dynamic per-result OG image generation for shared states is still optional future work; the compact share route is structured so that can be layered in later without changing the share payload format

## Notes

- The homepage is not designed as an ad shell.
- The calculator now lives directly on the homepage to avoid a duplicated preview-vs-full experience.
- The methodology emphasis is intentional and preserved across routes.
- The app estimates people matching published traits, not compatibility, dating intent, or mutual interest.

## Operator checklist before launch

- review the Privacy, Terms, FAQ, and About copy with the site's real support/privacy details
- verify the homepage metadata output matches `Canada Dating Pool Calculator`
- verify the low-emphasis homepage `About this tool` paragraph is present without overpowering the calculator
- verify `NEXT_PUBLIC_SUPPORT_URL` and any privacy email are set correctly
- verify ads, support CTA, analytics, and consent UI remain off unless intentionally enabled
- verify any future analytics or ad scripts match the current consent flags and privacy copy
- verify Cloudflare uses `npm run cf:build` rather than plain `npm run build` if deploying with Workers
- verify no under-18 path remains in the UI, readable URLs, or compact share restoration
- verify footer links work cleanly on both desktop and mobile
- verify the support/legal pages read well on mobile and do not contain placeholder language
- verify disabled launch-mode features are not visible in the public UI

For a fuller breakdown of route boundaries and future extensibility, see [`ARCHITECTURE.md`](/C:/Users/Tony/Documents/Dating%20Population%20Dashboard/ARCHITECTURE.md).
