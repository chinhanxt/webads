/**
 * Every commercial knob lives here. Change these, redeploy, done.
 */

export const site = {
  name: 'AutoQuote Hub',
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'carinsurance.freepro.online',
  get url() {
    return `https://${this.domain}`
  },
  tagline: 'Compare car insurance rates by city, state and driver profile',
  email: 'hello@freepro.online',
}

/**
 * Adsterra placements — https://beta.publishers.adsterra.com/websites
 *
 * 1. Add the domain as a website, wait for approval.
 * 2. Create the placements below, paste each key here (or into .env.local).
 *
 * `banner` keys come from the "Banner" placement type: Adsterra shows you an
 * `atOptions = { key: '...' }` snippet — you only need the key string.
 * `native` / `socialBar` / `popunder` keys are the path segment of the invoke
 * script URL, e.g. //pl27123456.effectiveratecpm.com/<KEY>/invoke.js
 */
export const ads = {
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED !== 'false',

  banner728: {
    key: process.env.NEXT_PUBLIC_ADSTERRA_728 || '',
    width: 728,
    height: 90,
  },
  banner300: {
    key: process.env.NEXT_PUBLIC_ADSTERRA_300 || '',
    width: 300,
    height: 250,
  },
  banner320: {
    key: process.env.NEXT_PUBLIC_ADSTERRA_320 || '',
    width: 320,
    height: 50,
  },

  /** Native Banner: full invoke.js src, without protocol. */
  nativeSrc: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SRC || '',
  /** The container id Adsterra pairs with the native script. */
  nativeContainerId: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ID || '',

  /** Social Bar: full script src, without protocol. Loads once, site-wide. */
  socialBarSrc: process.env.NEXT_PUBLIC_ADSTERRA_SOCIALBAR_SRC || '',
  /** Popunder: full script src, without protocol. Loads once, site-wide. */
  popunderSrc: process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_SRC || '',
}

/**
 * Lead affiliate. This out-earns display ads roughly 3:1 on this niche, so the
 * CTA gets the best real estate on every page.
 */
export const affiliate = {
  /** {ZIP} is replaced with whatever the visitor typed, or the city default. */
  quoteUrl:
    process.env.NEXT_PUBLIC_AFFILIATE_URL ||
    'https://example-partner.com/auto?zip={ZIP}&sub={SUB}',
  ctaLabel: 'See real quotes for my ZIP',
  disclosure:
    'We may be paid a referral fee when you request quotes through partner links on this page. It never changes what you pay.',
}

export function quoteLink(zip: string, sub: string) {
  return affiliate.quoteUrl
    .replace('{ZIP}', encodeURIComponent(zip))
    .replace('{SUB}', encodeURIComponent(sub))
}
