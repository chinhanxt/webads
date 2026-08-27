import type { Metadata } from 'next'
import Link from 'next/link'
import { AdLeaderboard, AdNative } from '@/components/AdSlot'
import CalculatorHub from '@/components/CalculatorHub'
import Faq from '@/components/Faq'
import { CITIES, STATES, stateCityMult } from '@/lib/data'
import { site } from '@/lib/config'
import { estimate, money } from '@/lib/rates'
import { JsonLd, canonical, faqJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Car Insurance Quotes & Average Rates by City — AutoQuote Hub',
  description:
    'Compare estimated car insurance rates for 3,000+ US cities. See average premiums by state, age, driving record and insurer, plus every state minimum coverage requirement.',
  alternates: { canonical: canonical('/') },
}

const faqs = [
  {
    q: 'How much is car insurance per month on average?',
    a: 'Across the states we model, full coverage averages roughly $170–$300 a month depending on where you live, with state-minimum liability typically a third of that. Louisiana, Florida, New York and Michigan sit at the top; Vermont, Maine and Idaho at the bottom.',
  },
  {
    q: 'Why is car insurance more expensive in some cities?',
    a: 'Premiums are rated at ZIP level on claim frequency and severity. Dense urban ZIPs generate more collisions, more theft and vandalism, more uninsured motorists and higher repair labour costs, so the same driver pays materially more in a metro than 40 miles outside it.',
  },
  {
    q: 'How often should I shop for car insurance?',
    a: 'Every renewal, and immediately after any life event that changes your rating — moving, marrying, buying a car, or a violation dropping off your record after three to five years. Insurers price new business more aggressively than renewals.',
  },
  {
    q: 'Are these numbers real quotes?',
    a: 'No. They are modelled estimates built from published state average premiums and standard rating factors, and are meant to tell you what range to expect. Only an insurer can quote you a binding price.',
  },
]

export default function Home() {
  const top = CITIES.slice(0, 24)
  const ranked = STATES.map((s) => ({
    s,
    annual: estimate(s, stateCityMult(s.slug)).annual,
  })).sort((a, b) => a.annual - b.annual)

  return (
    <div className="prose-body">
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: site.name,
          url: site.url,
        }}
      />

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-white px-6 py-10 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          What should you be paying for car insurance?
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Estimated rates for {CITIES.length.toLocaleString('en-US')} US cities, broken
          down by state, age, driving record and insurer — so you know whether your
          renewal notice is fair before you sign it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/car-insurance-calculator/"
            className="rounded-lg bg-sky-600 px-6 py-3 font-bold text-white no-underline shadow-lg shadow-sky-600/25 transition hover:bg-sky-500"
          >
            Estimate my premium →
          </Link>
          <Link
            href="/states/"
            className="rounded-lg border border-slate-300 px-6 py-3 font-bold text-slate-700 no-underline transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-700 dark:text-slate-300"
          >
            Browse by state
          </Link>
        </div>
      </section>

      <AdLeaderboard />

      <h2>Estimate your premium</h2>
      <CalculatorHub states={STATES} />

      <AdNative />

      <h2>Largest cities</h2>
      <div className="my-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {top.map((c) => (
          <Link
            key={`${c.stateSlug}-${c.slug}`}
            href={`/car-insurance/${c.stateSlug}/${c.slug}/`}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm no-underline transition hover:border-sky-400 dark:border-slate-800"
          >
            <span className="block font-semibold text-slate-800 dark:text-slate-200">
              {c.name}
            </span>
            <span className="text-xs text-slate-500">{c.state}</span>
          </Link>
        ))}
      </div>

      <h2>Cheapest and most expensive states</h2>
      <div className="my-6 grid gap-6 sm:grid-cols-2">
        <RankList title="Cheapest states" rows={ranked.slice(0, 10)} />
        <RankList title="Most expensive states" rows={ranked.slice(-10).reverse()} />
      </div>

      <h2>Frequently asked questions</h2>
      <Faq items={faqs} />

      <AdLeaderboard />
    </div>
  )
}

function RankList({
  title,
  rows,
}: {
  title: string
  rows: { s: (typeof STATES)[number]; annual: number }[]
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-slate-950 dark:text-slate-300">
        {title}
      </div>
      {rows.map(({ s, annual }) => (
        <Link
          key={s.slug}
          href={`/car-insurance/${s.slug}/`}
          className="flex items-baseline justify-between gap-2 border-t border-slate-100 px-4 py-2.5 text-sm no-underline transition hover:bg-sky-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          <span className="font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
          <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
            {money(annual)}
          </span>
        </Link>
      ))}
    </div>
  )
}
