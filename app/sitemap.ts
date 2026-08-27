import type { MetadataRoute } from 'next'
import { site } from '@/lib/config'
import { AGE_PAGES, CHEAP_CITIES, CITIES, STATES } from '@/lib/data'

/**
 * Every URL on the site, built from the same data the pages are built from, so
 * the sitemap can never drift from what actually got exported.
 *
 * A single sitemap file is only valid up to 50,000 URLs. Current total is
 * 1 + 1 + 1 + 3 + 51 + 3,113 + 1,063 + 51 + 510 = 4,794 — well inside the limit.
 */
// Required by `output: 'export'` — this route is generated once at build time.
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const url = (path: string) => `${site.url}${path}`

  const entries: MetadataRoute.Sitemap = [
    {
      url: url('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: url('/states/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: url('/car-insurance-calculator/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  for (const path of ['/methodology/', '/privacy/', '/terms/']) {
    entries.push({
      url: url(path),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    })
  }

  for (const s of STATES) {
    entries.push({
      url: url(`/car-insurance/${s.slug}/`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  for (const c of CITIES) {
    entries.push({
      url: url(`/car-insurance/${c.stateSlug}/${c.slug}/`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  for (const c of CHEAP_CITIES) {
    entries.push({
      url: url(`/cheap-car-insurance/${c.stateSlug}/${c.slug}/`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  for (const s of STATES) {
    entries.push({
      url: url(`/sr22-insurance/${s.slug}/`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  for (const s of STATES) {
    for (const age of AGE_PAGES) {
      entries.push({
        url: url(`/car-insurance-by-age/${s.slug}/${age}/`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  return entries
}
