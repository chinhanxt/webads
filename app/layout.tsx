import type { Metadata } from 'next'
import './globals.css'
import { AdGlobalScripts } from '@/components/AdSlot'
import { SiteFooter, SiteHeader } from '@/components/Shell'
import { site } from '@/lib/config'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Car Insurance Quotes & Rates by City`,
    template: `%s | ${site.name}`,
  },
  description: site.tagline,
  robots: { index: true, follow: true },
  openGraph: { siteName: site.name, type: 'website', locale: 'en_US' },
}

/**
 * Impact.com site-ownership verification.
 *
 * Not routed through Next's `metadata.other`: that helper emits
 * `content="..."`, and Impact's checker reads `value="..."`. `value` is not in
 * React's `<meta>` prop types — it is only modelled for form controls — so the
 * attribute set is asserted here and spread onto the element. React hoists it
 * into <head> on every page.
 */
const IMPACT_VERIFICATION = {
  name: 'impact-site-verification',
  value: 'cd47280d-0982-4a52-8cb3-1f6e6bac96ab',
} as React.MetaHTMLAttributes<HTMLMetaElement>

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <meta {...IMPACT_VERIFICATION} />
      <body className="bg-white text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-200">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <SiteFooter />
        <AdGlobalScripts />
      </body>
    </html>
  )
}
