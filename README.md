# AutoQuote Hub

A programmatic-SEO car insurance comparison site: Next.js 15 App Router, TypeScript,
Tailwind v4, exported as pure static HTML (`output: 'export'`) and served from
Cloudflare Pages for $0. Every page is prebuilt from two committed JSON datasets
(`data/states.json`, `data/cities.json`) and a transparent premium model in
`lib/rates.ts` — there is no server, no database and no runtime API call. Revenue
comes from Adsterra display placements plus a lead affiliate CTA; both are
configured entirely through `NEXT_PUBLIC_*` env vars (see `.env.local.example`).

## Page inventory

| Route pattern | Count | Source |
| --- | ---: | --- |
| `/` | 1 | `app/page.tsx` |
| `/states/` | 1 | `app/states/page.tsx` |
| `/car-insurance-calculator/` | 1 | `app/car-insurance-calculator/page.tsx` |
| `/methodology/`, `/privacy/`, `/terms/` | 3 | static |
| `/car-insurance/{state}/` | 51 | `STATES` |
| `/car-insurance/{state}/{city}/` | 3,113 | `CITIES` |
| `/cheap-car-insurance/{state}/{city}/` | 1,063 | `CHEAP_CITIES` (rank <= 25 per state) |
| `/sr22-insurance/{state}/` | 51 | `STATES` |
| `/car-insurance-by-age/{state}/{age}/` | 510 | 51 states x 10 ages in `AGE_PAGES` |
| **Total** | **4,794** | all listed in `app/sitemap.ts` |

4,794 URLs is well under the 50,000-URL limit for a single sitemap file, so
`sitemap.xml` stays valid as one document. If `CITIES` ever grows past ~46,000
rows, split the sitemap into an index before shipping.

Every count above is derived at build time — nothing is hardcoded in
`app/sitemap.ts`, it imports `STATES`, `CITIES`, `CHEAP_CITIES` and `AGE_PAGES`
from `lib/data.ts`.

## Local development

```bash
npm install
cp .env.local.example .env.local     # then fill in the values you have
npm run dev                          # http://localhost:3000
npm run build                        # static export -> ./out
npm run lint
npx tsc --noEmit                     # type check only
```

`npm run build` writes ~4,794 HTML files plus `sitemap.xml` and `robots.txt`
into `out/`. Expect it to take a few minutes; it is CPU-bound on page rendering.
Serve the result locally with:

```bash
npx serve out
```

`npm start` does not apply here — there is no Node server in an exported build.

## Regenerating the city dataset

`data/cities.json` is committed, so a normal build never needs this. Rerun it
when GeoNames publishes new population figures or you want to change the
`MIN_POP` / tier thresholds in `scripts/build-data.mjs`.

Fetch the two raw inputs into `data/raw/` (gitignored):

```bash
mkdir -p data/raw

# 1. GeoNames cities5000 (CC BY 4.0) — populated places, tab-separated.
curl -L -o data/raw/cities5000.zip https://download.geonames.org/export/dump/cities5000.zip
unzip -o data/raw/cities5000.zip -d data/raw/     # -> data/raw/cities5000.txt

# 2. US ZIP code dataset (public domain), saved as b.json.
curl -L -o data/raw/b.json https://raw.githubusercontent.com/millbj92/US-Zip-Codes-JSON/master/USCities.json
```

Then:

```bash
node scripts/build-data.mjs
```

It reads `data/raw/cities5000.txt` and `data/raw/b.json`, keeps US places of
type `PPL`/`PPLA*`/`PPLC`/`PPLG` with population >= 15,000 in the 51
jurisdictions listed in `data/states.json`, attaches up to 6 ZIP codes per city
(by name match, falling back to nearest-ZIP proximity), assigns a size tier and
cost multiplier, ranks cities within each state, and overwrites
`data/cities.json`. It prints the resulting city count, ZIP coverage and the
fattest/thinnest states — sanity-check those numbers before committing.

Note that changing the city count changes the page count and the sitemap; the
`rank <= 25` filter in `lib/data.ts` is what decides which cities also get a
`/cheap-car-insurance/` page.

## Wiring Adsterra

Adsterra will not approve a domain that does not already serve real content, so
deploy first with ads disabled, then apply.

1. Deploy the site (see below) with `NEXT_PUBLIC_ADS_ENABLED=false`. Ad slots
   render as grey placeholder boxes; nothing else changes.
2. Go to https://beta.publishers.adsterra.com/websites and click **Add website**.
   Enter the bare domain (the same value as `NEXT_PUBLIC_SITE_DOMAIN`), category
   Finance, traffic type Mainstream.
3. Wait for the site to flip from Pending to Approved.
4. On the approved website row, **Add placement** five times:
   - Banner 728x90 -> key goes in `NEXT_PUBLIC_ADSTERRA_728`
   - Banner 300x250 -> key goes in `NEXT_PUBLIC_ADSTERRA_300`
   - Banner 320x50 -> key goes in `NEXT_PUBLIC_ADSTERRA_320`
   - Native Banner -> script `src` goes in `NEXT_PUBLIC_ADSTERRA_NATIVE_SRC`,
     and the paired `<div>` id goes in `NEXT_PUBLIC_ADSTERRA_NATIVE_ID`
   - Social Bar -> script `src` goes in `NEXT_PUBLIC_ADSTERRA_SOCIALBAR_SRC`
   - Popunder (optional) -> script `src` goes in `NEXT_PUBLIC_ADSTERRA_POPUNDER_SRC`

   For the three Banner placements copy only the `key` string out of the
   `atOptions = { 'key': '...' }` snippet. For Native/Social Bar/Popunder copy
   the whole protocol-relative script src,
   e.g. `//pl27123456.effectiveratecpm.com/<hash>/invoke.js`.
5. Set `NEXT_PUBLIC_ADS_ENABLED=true`, put the keys in `.env.local` locally and
   in the Cloudflare Pages env vars for production, and rebuild. These values are
   inlined at build time — a dashboard edit alone does nothing until you redeploy.
6. Set `NEXT_PUBLIC_AFFILIATE_URL` to your real partner link, keeping both the
   `{ZIP}` and `{SUB}` tokens; `lib/config.ts` substitutes them per click so the
   sub-id tells you which page converted.

`.env.local.example` documents every variable individually. Anything left blank
degrades gracefully: the corresponding slot renders a placeholder rather than
breaking the page.

## Deploying to Cloudflare Pages

Create a Pages project connected to the repo, or push the `out/` directory
directly with Wrangler.

Git-connected project settings:

- Framework preset: **None** (do not pick "Next.js" — that preset assumes the
  Edge runtime adapter, which this project does not use)
- Build command: `npm run build`
- Build output directory: `out`
- Root directory: `/`
- Node version: 20 or newer (set `NODE_VERSION=20` as an env var if the default
  build image is older)

Set the environment variables under **Settings -> Environment variables ->
Production** (and Preview if you want ads in previews). Add every variable from
`.env.local.example`; they must be present at build time, not runtime. After
changing any of them, trigger **Retry deployment** — Pages does not rebuild on an
env var change alone.

Then **Custom domains -> Set up a custom domain**, add the apex domain and the
`www` subdomain, and make sure the apex matches `NEXT_PUBLIC_SITE_DOMAIN` exactly.
Redirect `www` to the apex with a Pages redirect rule so canonicals and the
sitemap point at a single hostname.

Direct upload without Git:

```bash
npm run build
npx wrangler pages deploy out --project-name=autoquotehub
```

With this route the env vars must exist in your shell (or `.env.local`) at build
time; the Pages dashboard values are irrelevant because the build happens locally.

Verify after deploy:

```bash
curl -sI https://<domain>/car-insurance/texas/houston/ | head -1
curl -s  https://<domain>/robots.txt
curl -s  https://<domain>/sitemap.xml | grep -c '<loc>'   # expect 4794
```

## Post-deploy SEO checklist

1. **Google Search Console** — add the property. Use the Domain property type and
   verify with the DNS TXT record (Cloudflare DNS -> Records -> Add record, type
   TXT). Domain verification covers apex, www and https in one go.
2. **Submit the sitemap** — Search Console -> Sitemaps -> enter `sitemap.xml`.
   Confirm it reports 4,794 discovered URLs and 0 errors. If it reports fewer,
   the build ran with a stale `data/cities.json`.
3. **Bing Webmaster Tools** — import the property straight from Search Console,
   then submit the same sitemap. Bing indexes a new site of this size faster than
   Google and gives usable query data in week one.
4. **Spot-check indexability** — run the URL Inspection tool on one page of each
   route pattern (state, city, cheap, sr22, age). Each must report "URL is
   available to Google", show a self-referencing canonical, and render the
   generated JSON-LD.
5. **Confirm robots.txt** — it must allow all and list
   `https://<domain>/sitemap.xml`. A stale `NEXT_PUBLIC_SITE_DOMAIN` is the usual
   cause of a sitemap URL pointing at the wrong host.
6. **Core Web Vitals** — static HTML with no blocking third-party CSS should pass
   easily; the thing that breaks it is the Social Bar / Popunder script. If CWV
   degrades after enabling ads, drop the Popunder first.
7. **Expected timeline** — sitemap processed within 1-3 days; first few hundred
   pages indexed in week 1-2; the bulk of the 4,794 crawled over 4-10 weeks, since
   Google throttles crawl rate on a new domain regardless of how many URLs you
   submit. Meaningful organic traffic on a fresh domain in this niche realistically
   starts at month 3-6. Do not resubmit the sitemap to speed this up; it does
   nothing. Adding real backlinks and keeping the dataset fresh does.
8. **Watch for thin-content flags** — the `/cheap-car-insurance/` and
   `/car-insurance-by-age/` patterns are the most template-like. If Search Console
   starts reporting large numbers of "Crawled - currently not indexed" on those,
   tighten the `rank <= 25` filter or expand the per-page copy in `lib/copy.ts`
   before adding more page types.
