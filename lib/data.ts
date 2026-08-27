import statesJson from '@/data/states.json'
import citiesJson from '@/data/cities.json'
import type { CityRow, StateRow } from './rates'

export const STATES = statesJson as StateRow[]
export const CITIES = citiesJson as CityRow[]

const stateBySlug = new Map(STATES.map((s) => [s.slug, s]))
const stateByCode = new Map(STATES.map((s) => [s.code, s]))

const citiesByState = new Map<string, CityRow[]>()
for (const c of CITIES) {
  const list = citiesByState.get(c.stateSlug)
  if (list) list.push(c)
  else citiesByState.set(c.stateSlug, [c])
}
for (const list of citiesByState.values()) list.sort((a, b) => b.pop - a.pop)

const cityByKey = new Map(CITIES.map((c) => [`${c.stateSlug}/${c.slug}`, c]))

export const getState = (slug: string) => stateBySlug.get(slug)
export const getStateByCode = (code: string) => stateByCode.get(code)
export const getCities = (stateSlug: string) => citiesByState.get(stateSlug) ?? []
export const getCity = (stateSlug: string, citySlug: string) =>
  cityByKey.get(`${stateSlug}/${citySlug}`)

/** Cities that also get a /cheap-car-insurance page — the top 25 per state. */
export const CHEAP_CITIES = CITIES.filter((c) => c.rank <= 25)

/** Ages that get their own landing page. These are the ones people search. */
export const AGE_PAGES = [16, 18, 19, 20, 21, 25, 30, 50, 65, 70] as const

export function nearbyCities(city: CityRow, n = 8): CityRow[] {
  return getCities(city.stateSlug)
    .filter((c) => c.slug !== city.slug)
    .map((c) => ({
      c,
      d: (c.lat - city.lat) ** 2 + ((c.lon - city.lon) * 0.76) ** 2,
    }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.c)
}

/** State-wide average of the city multipliers, population weighted. */
export function stateCityMult(stateSlug: string): number {
  const list = getCities(stateSlug)
  if (!list.length) return 1
  const totalPop = list.reduce((a, c) => a + c.pop, 0)
  return list.reduce((a, c) => a + c.mult * c.pop, 0) / totalPop
}
