import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdLeaderboard, AdNative } from '@/components/AdSlot'
import Faq from '@/components/Faq'
import QuoteCalculator from '@/components/QuoteCalculator'
import { Breadcrumbs } from '@/components/Shell'
import { CarrierTable, CoverageTable, RecordTable } from '@/components/Tables'
import { AGE_PAGES, STATES, getCities, getState, stateCityMult } from '@/lib/data'
import { estimate, money } from '@/lib/rates'
import { JsonLd, breadcrumbJsonLd, canonical, faqJsonLd } from '@/lib/seo'

type Params = { state: string; age: string }

export function generateStaticParams() {
  return STATES.flatMap((s) => AGE_PAGES.map((a) => ({ state: s.slug, age: String(a) })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { state: slug, age: ageStr } = await params
  const state = getState(slug)
  const age = Number(ageStr)
  if (!state || !AGE_PAGES.includes(age as (typeof AGE_PAGES)[number])) return {}
  const r = estimate(state, stateCityMult(slug), { age })
  const path = `/car-insurance-by-age/${slug}/${age}/`
  const title = `Car Insurance for ${age}-Year-Olds in ${state.name} — ${money(r.monthly)}/mo`
  const description = `Car insurance for a ${age}-year-old driver in ${state.name} costs an estimated ${money(r.annual)} a year for full coverage. Compare insurers, coverage levels and ways to cut the premium.`
  return {
    title,
    description,
    alternates: { canonical: canonical(path) },
    openGraph: { title, description, url: canonical(path) },
  }
}

export default async function AgePage({ params }: { params: Promise<Params> }) {
  const { state: slug, age: ageStr } = await params
  const state = getState(slug)
  const age = Number(ageStr)
  if (!state || !AGE_PAGES.includes(age as (typeof AGE_PAGES)[number])) notFound()

  const mult = stateCityMult(slug)
  const r = estimate(state, mult, { age })
  const min = estimate(state, mult, { age, coverage: 'minimum' })
  const adult = estimate(state, mult, { age: 35 })
  const delta = Math.round((r.annual / adult.annual - 1) * 100)
  const cities = getCities(slug)
  const teen = age < 25

  const faqs = [
    {
      q: `How much is car insurance for a ${age}-year-old in ${state.name}?`,
      a: `An estimated ${money(r.annual)} a year for full coverage — about ${money(r.monthly)} a month — and ${money(min.annual)} a year for state-minimum liability. That is ${delta >= 0 ? `${delta}% above` : `${Math.abs(delta)}% below`} what a 35-year-old pays in ${state.name}.`,
    },
    teen
      ? {
          q: `Is it cheaper to add a ${age}-year-old to a parent's policy?`,
          a: `Almost always, yes. Adding a young driver to an existing family policy typically costs far less than a standalone policy, because the household keeps its multi-car and multi-policy discounts and the parent's claims history anchors the rating.`,
        }
      : {
          q: `Do rates drop at ${age} in ${state.name}?`,
          a: `Premiums fall steadily from the mid-twenties, bottom out around 55 to 60, and start climbing again after 70 as claim frequency rises. At ${age}, a ${state.name} driver sits ${delta >= 0 ? `${delta}% above` : `${Math.abs(delta)}% below`} the 35-year-old benchmark on our model.`,
        },
    {
      q: `Which insurer is cheapest for a ${age}-year-old in ${state.name}?`,
      a: `On our modelled comparison, Geico and State Farm price lowest for this age band in ${state.name}, with USAA lower still for military families. Because young-driver rating varies enormously between carriers, quoting three or four is worth considerably more at this age than at any other.`,
    },
    {
      q: `What discounts apply at ${age}?`,
      a: teen
        ? `Good-student discounts (usually a B average or better), driver-training course credits, distant-student discounts if the car stays at home, and telematics programmes that reward smooth driving. Stacked, these routinely take 15–25% off a young driver's premium.`
        : `Low-mileage, defensive-driving course credits, multi-policy bundling, paid-in-full discounts and telematics. Drivers over 55 in most states get a specific credit for completing an approved mature-driver course.`,
    },
  ]

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: state.name, path: `/car-insurance/${state.slug}/` },
    { name: `Age ${age}`, path: `/car-insurance-by-age/${state.slug}/${age}/` },
  ]

  return (
    <article className="prose-body">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        Car Insurance for {age}-Year-Olds in {state.name}
      </h1>

      <p className="mt-5 text-lg">
        A {age}-year-old driver in {state.name} pays an estimated {money(r.annual)} a year
        for full coverage, or {money(r.monthly)} a month. That is{' '}
        {delta >= 0 ? `${delta}% more than` : `${Math.abs(delta)}% less than`} the{' '}
        {money(adult.annual)} a 35-year-old pays on the same policy.{' '}
        {teen
          ? 'Age is the single largest rating factor at this end of the curve, and it improves every year until the mid-twenties.'
          : 'Age matters less here than driving record and ZIP code, both of which you have more control over.'}
      </p>

      <AdLeaderboard />

      <QuoteCalculator
        state={state}
        cityMult={mult}
        defaultZip={cities[0]?.zips[0] ?? ''}
        sub={`${state.code}-age${age}`}
      />

      <h2>Cheapest insurers for a {age}-year-old in {state.name}</h2>
      <CarrierTable state={state} cityMult={mult} where={`${state.name} at age ${age}`} />

      <AdNative />

      <h2>Coverage levels at {age}</h2>
      <CoverageTable state={state} cityMult={mult} where={`${state.name} at age ${age}`} />

      <h2>What a violation costs at this age</h2>
      <RecordTable state={state} cityMult={mult} where={state.name} />

      <h2>Frequently asked questions</h2>
      <Faq items={faqs} />

      <h2>Other ages in {state.name}</h2>
      <div className="my-6 flex flex-wrap gap-2">
        {AGE_PAGES.filter((a) => a !== age).map((a) => (
          <Link
            key={a}
            href={`/car-insurance-by-age/${state.slug}/${a}/`}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-800 dark:text-slate-300"
          >
            Age {a}
          </Link>
        ))}
      </div>

      <AdLeaderboard />
    </article>
  )
}
