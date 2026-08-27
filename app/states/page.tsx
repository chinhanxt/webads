import type { Metadata } from 'next'
import Link from 'next/link'
import { AdLeaderboard } from '@/components/AdSlot'
import { Breadcrumbs } from '@/components/Shell'
import { STATES, getCities, stateCityMult } from '@/lib/data'
import { estimate, money } from '@/lib/rates'
import { JsonLd, breadcrumbJsonLd, canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Average Car Insurance Rates by State — All 50 States + DC',
  description:
    'Compare estimated average car insurance rates in all 50 states and Washington DC, with minimum coverage requirements and city-level breakdowns.',
  alternates: { canonical: canonical('/states/') },
}

export default function StatesIndex() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'States', path: '/states/' },
  ]
  const rows = STATES.map((s) => ({
    s,
    annual: estimate(s, stateCityMult(s.slug)).annual,
    cities: getCities(s.slug).length,
  })).sort((a, b) => a.s.name.localeCompare(b.s.name))

  return (
    <article className="prose-body">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        Car Insurance Rates by State
      </h1>
      <p className="mt-5 text-lg">
        Estimated annual full-coverage premium for a 35-year-old driver with a clean
        record, in all 50 states and the District of Columbia.
      </p>

      <AdLeaderboard />

      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="bg-slate-50 px-4 py-3 text-left font-semibold dark:bg-slate-950">
                State
              </th>
              <th className="bg-slate-50 px-4 py-3 text-left font-semibold dark:bg-slate-950">
                Full coverage / yr
              </th>
              <th className="bg-slate-50 px-4 py-3 text-left font-semibold dark:bg-slate-950">
                Minimum limits
              </th>
              <th className="bg-slate-50 px-4 py-3 text-left font-semibold dark:bg-slate-950">
                Cities priced
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, annual, cities }) => (
              <tr key={s.slug}>
                <td className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                  <Link
                    className="font-semibold no-underline hover:underline"
                    href={`/car-insurance/${s.slug}/`}
                  >
                    {s.name}
                  </Link>
                </td>
                <td className="border-t border-slate-100 px-4 py-3 font-semibold tabular-nums text-slate-900 dark:border-slate-800 dark:text-white">
                  {money(annual)}
                </td>
                <td className="border-t border-slate-100 px-4 py-3 tabular-nums dark:border-slate-800">
                  {s.bi1
                    ? `${s.bi1 / 1000}/${s.bi2 / 1000}/${s.pd / 1000}`
                    : `PD ${s.pd / 1000}k`}
                </td>
                <td className="border-t border-slate-100 px-4 py-3 tabular-nums dark:border-slate-800">
                  {cities}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdLeaderboard />
    </article>
  )
}
