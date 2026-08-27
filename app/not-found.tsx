import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'That page does not exist. Start from the state index or the calculator.',
  robots: { index: false, follow: true },
}

const LINKS = [
  { href: '/', label: 'Home', blurb: 'Start over from the top of the site.' },
  {
    href: '/states/',
    label: 'All states',
    blurb: 'Average rates for all 50 states and DC, with city breakdowns.',
  },
  {
    href: '/car-insurance-calculator/',
    label: 'Rate calculator',
    blurb: 'Estimate a premium from your age, ZIP, vehicle and driving record.',
  },
]

export default function NotFound() {
  return (
    <article className="prose-body">
      <p className="text-sm font-semibold tracking-wide text-sky-600 uppercase dark:text-sky-500">
        404
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        We could not find that page
      </h1>
      <p className="mt-5 text-lg">
        The link may be out of date, or the city or state slug may be misspelled. Try one
        of these instead.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block h-full rounded-xl border border-slate-200 px-4 py-4 transition-colors hover:border-sky-600 dark:border-slate-800 dark:hover:border-sky-600"
            >
              <span className="font-semibold text-slate-900 dark:text-white">
                {l.label}
              </span>
              <span className="mt-1 block text-sm text-slate-500 dark:text-slate-500">
                {l.blurb}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
