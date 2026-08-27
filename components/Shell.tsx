import Link from 'next/link'
import { site } from '@/lib/config'

/** Site mark — same geometry as app/favicon.ico so the tab and the header match. */
export function ShieldMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <path
        d="M16 1.4 29.9 6.9v9.1c0 6.2-4.2 11-13.9 15.5C6.3 27 2.1 22.2 2.1 16V6.9z"
        fill="#0284c7"
      />
      <path
        d="M9.4 16.5 14.1 21.1 23.0 11.0"
        fill="none"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-500"
    >
      {items.map((c, i) => (
        <span key={c.path} className="flex items-center gap-1">
          {i > 0 && <span className="text-slate-300 dark:text-slate-700">/</span>}
          {i === items.length - 1 ? (
            <span className="text-slate-700 dark:text-slate-300">{c.name}</span>
          ) : (
            <Link
              className="text-slate-500 no-underline hover:text-sky-600 hover:underline dark:text-slate-500"
              href={c.path}
            >
              {c.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <ShieldMark className="h-7 w-7 shrink-0" />
          <span className="text-slate-900 dark:text-white">{site.name}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link className="hover:text-sky-600" href="/car-insurance-calculator">
            Calculator
          </Link>
          <Link className="hidden hover:text-sky-600 sm:block" href="/states">
            States
          </Link>
          <Link className="hidden hover:text-sky-600 sm:block" href="/methodology">
            Methodology
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-slate-500 dark:text-slate-500">
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-medium">
          <Link className="hover:text-sky-600" href="/states">
            All states
          </Link>
          <Link className="hover:text-sky-600" href="/car-insurance-calculator">
            Calculator
          </Link>
          <Link className="hover:text-sky-600" href="/methodology">
            Methodology
          </Link>
          <Link className="hover:text-sky-600" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-sky-600" href="/terms">
            Terms
          </Link>
        </div>
        <p className="mt-6 leading-relaxed">
          {site.name} is an independent comparison site. We are not an insurer, an agent
          or a broker, and nothing here is a binding quote or insurance advice. Premium
          figures are modelled estimates built from published state average rates — read
          the <Link className="underline" href="/methodology">methodology</Link> before
          relying on them. We may earn a referral fee when you request quotes through
          partner links.
        </p>
        <p className="mt-4">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
