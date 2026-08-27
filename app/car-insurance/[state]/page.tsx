import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdLeaderboard, AdNative, AdRectangle } from '@/components/AdSlot'
import Faq from '@/components/Faq'
import QuoteCalculator from '@/components/QuoteCalculator'
import { Breadcrumbs } from '@/components/Shell'
import {
  AgeTable,
  CarrierTable,
  CoverageTable,
  MinimumsTable,
  RecordTable,
} from '@/components/Tables'
import { STATES, getCities, getState, stateCityMult } from '@/lib/data'
import { stateIntro } from '@/lib/copy'
import { estimate, money } from '@/lib/rates'
import { JsonLd, breadcrumbJsonLd, canonical, faqJsonLd } from '@/lib/seo'

type Params = { state: string }

export function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { state: slug } = await params
  const state = getState(slug)
  if (!state) return {}
  const r = estimate(state, stateCityMult(slug))
  const path = `/car-insurance/${slug}/`
  const title = `${state.name} Car Insurance Quotes — ${money(r.monthly)}/mo Average Rates`
  const description = `Average car insurance cost in ${state.name} is an estimated ${money(r.annual)} a year for full coverage. Compare rates by city, age, driving record and insurer, plus ${state.name} minimum coverage requirements.`
  return {
    title,
    description,
    alternates: { canonical: canonical(path) },
    openGraph: { title, description, url: canonical(path) },
  }
}

export default async function StatePage({ params }: { params: Promise<Params> }) {
  const { state: slug } = await params
  const state = getState(slug)
  if (!state) notFound()

  const cities = getCities(slug)
  const mult = stateCityMult(slug)
  const r = estimate(state, mult)
  const min = estimate(state, mult, { coverage: 'minimum' })
  const cheapest = [...cities].sort((a, b) => a.mult - b.mult || a.pop - b.pop)[0]
  const priciest = [...cities].sort((a, b) => b.mult - a.mult || b.pop - a.pop)[0]

  const faqs = [
    {
      q: `How much is car insurance in ${state.name}?`,
      a: `Full coverage in ${state.name} is estimated at ${money(r.annual)} a year, or ${money(r.monthly)} a month, for a 35-year-old with a clean record. A state-minimum policy is estimated at ${money(min.annual)} a year.`,
    },
    {
      q: `What car insurance is required in ${state.name}?`,
      a: state.bi1
        ? `${state.name} requires ${money(state.bi1)} bodily injury liability per person, ${money(state.bi2)} per accident and ${money(state.pd)} property damage${state.extras.length ? `, plus ${state.extras.join(', ').toLowerCase()}` : ''}.`
        : `${state.name} requires ${money(state.pd)} of property damage liability${state.extras.length ? `, plus ${state.extras.join(', ').toLowerCase()}` : ''}.`,
    },
    {
      q: `Is ${state.name} a no-fault state?`,
      a: state.noFault
        ? `Yes. ${state.name} is a no-fault state: your own personal injury protection pays your initial medical bills regardless of who caused the crash, and your right to sue the other driver is limited.`
        : `No. ${state.name} is an at-fault (tort) state, so the driver responsible for a crash — through their liability insurance — pays for the other party's injuries and property damage.`,
    },
    {
      q: `Which ${state.name} city has the cheapest car insurance?`,
      a: cheapest
        ? `Of the ${cities.length} ${state.name} cities we price, ${cheapest.name} carries the lowest estimate at ${money(estimate(state, cheapest.mult).annual)} a year, while ${priciest.name} is highest at ${money(estimate(state, priciest.mult).annual)}. Urban density is the main driver of the gap.`
        : `Rural ZIP codes in ${state.name} consistently price below the state's metro areas.`,
    },
    {
      q: `How can I get cheaper car insurance in ${state.name}?`,
      a: `Re-quote at every renewal rather than letting the policy roll, raise your deductible to $1,000 if you can absorb it, bundle with home or renters cover, and ask specifically about low-mileage, defensive-driving and telematics discounts. The spread between the cheapest and most expensive carrier on an identical risk is routinely close to 2x.`,
    },
  ]

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Car insurance', path: '/states/' },
    { name: state.name, path: `/car-insurance/${state.slug}/` },
  ]

  return (
    <article className="prose-body">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        {state.name} Car Insurance Quotes &amp; Average Rates
      </h1>

      <p className="mt-5 text-lg">{stateIntro(state, mult, cities.length)}</p>

      <AdLeaderboard />

      <QuoteCalculator
        state={state}
        cityMult={mult}
        defaultZip={cities[0]?.zips[0] ?? ''}
        sub={`${state.code}-state`}
      />

      <h2>Cheapest car insurance companies in {state.name}</h2>
      <CarrierTable state={state} cityMult={mult} where={state.name} />

      <AdNative />

      <h2>{state.name} car insurance rates by age</h2>
      <AgeTable
        state={state}
        cityMult={mult}
        where={state.name}
        stateSlug={state.slug}
      />

      <h2>How violations change your {state.name} premium</h2>
      <RecordTable state={state} cityMult={mult} where={state.name} />
      <p>
        A DUI in {state.name} usually also triggers an{' '}
        <Link href={`/sr22-insurance/${state.slug}/`}>SR-22 filing requirement</Link>,
        which most standard carriers will not write.
      </p>

      <AdRectangle />

      <h2>{state.name} minimum insurance requirements</h2>
      <MinimumsTable state={state} />
      <p>
        Limits are set by statute and change from time to time. Confirm the current
        figures with the{' '}
        <a href={state.doi} rel="nofollow noopener" target="_blank">
          {state.name} Department of Insurance
        </a>{' '}
        before you buy.
      </p>

      <h2>Coverage levels in {state.name}</h2>
      <CoverageTable state={state} cityMult={mult} where={state.name} />

      <h2>Car insurance rates in {state.name} cities</h2>
      <p>
        Estimated annual full-coverage premium for a 35-year-old with a clean record,
        across the {cities.length.toLocaleString('en-US')} {state.name} cities we price.
      </p>
      <div className="my-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-slate-800">
          {cities.map((c) => (
            <Link
              key={c.slug}
              href={`/car-insurance/${c.stateSlug}/${c.slug}/`}
              className="flex items-baseline justify-between gap-2 bg-white px-4 py-2.5 text-sm no-underline transition hover:bg-sky-50 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {c.name}
              </span>
              <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
                {money(estimate(state, c.mult).annual)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <h2>Frequently asked questions</h2>
      <Faq items={faqs} />

      <AdLeaderboard />
    </article>
  )
}
