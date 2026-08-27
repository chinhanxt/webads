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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-200">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <SiteFooter />
        <AdGlobalScripts />
      </body>
    </html>
  )
}
