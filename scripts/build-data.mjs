// Builds data/cities.json from GeoNames cities5000 + US ZIP dataset.
// Sources:
//   https://download.geonames.org/export/dump/cities5000.zip   (CC BY 4.0)
//   https://github.com/millbj92/US-Zip-Codes-JSON               (public domain)
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const RAW = path.join(ROOT, 'data', 'raw')
const MIN_POP = 15000

const KEEP_CODES = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC', 'PPLG'])

const states = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'states.json'), 'utf8'))
const byCode = new Map(states.map((s) => [s.code, s]))

const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// ---- 1. GeoNames -> populated places in the 51 jurisdictions we cover -------
const rows = fs.readFileSync(path.join(RAW, 'cities5000.txt'), 'utf8').split('\n')
const best = new Map() // "ST|slug" -> record

for (const line of rows) {
  if (!line) continue
  const f = line.split('\t')
  if (f[8] !== 'US') continue
  // PPL/PPLA*/PPLC only: PPLX is a *section* of a city (Manhattan, Upper West Side,
  // Maryvale) and would produce duplicate, wrongly-populated pages.
  if (!KEEP_CODES.has(f[7])) continue
  const pop = Number(f[14]) || 0
  if (pop < MIN_POP) continue
  const st = byCode.get(f[10])
  if (!st) continue
  const name = f[2]
  const slug = slugify(name)
  if (!slug) continue
  const key = `${st.code}|${slug}`
  const prev = best.get(key)
  if (prev && prev.pop >= pop) continue
  best.set(key, {
    name,
    slug,
    state: st.code,
    stateSlug: st.slug,
    pop,
    lat: Number(f[4]),
    lon: Number(f[5]),
    zips: [],
  })
}

// ---- 2. ZIP codes ----------------------------------------------------------
const zipRows = JSON.parse(fs.readFileSync(path.join(RAW, 'b.json'), 'utf8'))
const zipBuckets = new Map()
for (const z of zipRows) {
  if (!z.city || !z.state) continue
  const key = `${z.state}|${slugify(z.city)}`
  if (!zipBuckets.has(key)) zipBuckets.set(key, [])
  zipBuckets.get(key).push(String(z.zip_code).padStart(5, '0'))
}
for (const [key, city] of best) {
  const zips = zipBuckets.get(key)
  if (zips) city.zips = [...new Set(zips)].sort().slice(0, 6)
}

// Name-match misses ("St. Louis" vs "Saint Louis", CDPs with no USPS city of their
// own): fall back to the closest ZIP centroids inside the same state.
const zipsByState = new Map()
for (const z of zipRows) {
  if (!z.state || !Number.isFinite(z.latitude) || !Number.isFinite(z.longitude)) continue
  if (!zipsByState.has(z.state)) zipsByState.set(z.state, [])
  zipsByState.get(z.state).push(z)
}
let recovered = 0
for (const city of best.values()) {
  if (city.zips.length) continue
  const pool = zipsByState.get(city.state)
  if (!pool) continue
  const near = pool
    .map((z) => ({
      zip: String(z.zip_code).padStart(5, '0'),
      d: (z.latitude - city.lat) ** 2 + ((z.longitude - city.lon) * 0.76) ** 2,
    }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map((z) => z.zip)
  if (near.length) {
    city.zips = [...new Set(near)]
    recovered++
  }
}
console.log(`zips recovered by proximity: ${recovered}`)

// ---- 3. Density tier -> the city rate multiplier ---------------------------
// Urban density is the single strongest geographic driver of auto premiums
// (claim frequency, theft, litigation, repair labour cost).
function tierOf(pop) {
  if (pop >= 1_000_000) return { tier: 'metro', mult: 1.24 }
  if (pop >= 400_000) return { tier: 'major', mult: 1.16 }
  if (pop >= 150_000) return { tier: 'large', mult: 1.08 }
  if (pop >= 60_000) return { tier: 'mid', mult: 1.0 }
  if (pop >= 30_000) return { tier: 'small', mult: 0.94 }
  return { tier: 'town', mult: 0.89 }
}

const cities = [...best.values()]
  .map((c) => ({ ...c, ...tierOf(c.pop) }))
  .sort((a, b) => b.pop - a.pop)

// stable rank inside each state, used to pick which cities get extra page types
const seen = new Map()
for (const c of cities) {
  const n = (seen.get(c.state) ?? 0) + 1
  seen.set(c.state, n)
  c.rank = n
}

fs.writeFileSync(path.join(ROOT, 'data', 'cities.json'), JSON.stringify(cities))

const perState = [...seen.entries()].sort((a, b) => b[1] - a[1])
console.log(`cities: ${cities.length}  (pop >= ${MIN_POP})`)
console.log(`with zips: ${cities.filter((c) => c.zips.length).length}`)
console.log(`states covered: ${perState.length}`)
console.log(`top: ${perState.slice(0, 5).map(([s, n]) => `${s}=${n}`).join(' ')}`)
console.log(`thin: ${perState.slice(-5).map(([s, n]) => `${s}=${n}`).join(' ')}`)
