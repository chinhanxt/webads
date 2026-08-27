import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Shell'
import { site } from '@/lib/config'
import { JsonLd, breadcrumbJsonLd, canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${site.name} handles data: a static site with a browser-only calculator, no accounts and no forms, plus the third-party advertising and affiliate partners that do set cookies.`,
  alternates: { canonical: canonical('/privacy/') },
}

const UPDATED = 'August 27, 2026'

export default function Privacy() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Privacy', path: '/privacy/' },
  ]

  return (
    <article className="prose-body">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-5 text-lg">
        This policy explains what {site.name} ({site.domain}) does and does not do with
        your data. It describes this site as it is actually built, not a generic
        template.
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-500">
        Last updated: {UPDATED}
      </p>

      <h2>The short version</h2>
      <ul>
        <li>
          There are no accounts, no logins, no contact forms and no newsletter. We do not
          ask you for your name, email address, phone number or any other personal
          detail.
        </li>
        <li>
          The rate calculator runs entirely in your browser. Whatever you type into it —
          your age, ZIP code, vehicle, driving record — is used to do arithmetic on your
          own device and is never sent to us or stored anywhere.
        </li>
        <li>
          The site is a set of static files. We operate no database and no application
          server that receives your input.
        </li>
        <li>
          Third parties do collect data here: our advertising network sets cookies and ad
          identifiers, and affiliate partners collect whatever you give them after you
          click through to their sites.
        </li>
      </ul>

      <h2>Information we collect</h2>
      <h3>Information you provide</h3>
      <p>
        None. There is nowhere on this site to submit information to us. The calculator
        and any ZIP code box are client-side controls: they change what the page displays
        and nothing more. If you email us, we hold that email and your address only for
        as long as it takes to answer you.
      </p>

      <h3>Information collected automatically</h3>
      <p>
        The site is served as static files by a hosting and content-delivery provider.
        Like any web host, that provider processes the technical information every
        browser sends in order to deliver the page: your IP address, user agent, the URL
        requested, the referring URL and a timestamp. These are standard server logs held
        by the provider under its own retention schedule. We use them, if at all, only in
        aggregate to see which pages are being read and to diagnose outages.
      </p>
      <p>
        We do not run our own analytics script, fingerprinting library, session recorder
        or heatmap tool on this site.
      </p>

      <h2>Cookies and advertising identifiers</h2>
      <p>
        We do not set cookies of our own for tracking. Our advertising partner does.
      </p>
      <p>
        This site displays advertising served by the{' '}
        <strong>Adsterra advertising network</strong>. To serve and measure those ads,
        Adsterra and the advertisers and demand partners it works with may set and read
        cookies, local storage entries and similar identifiers in your browser, and may
        process your IP address, device and browser characteristics, approximate location
        derived from your IP address, and the pages you view on this site. This is used
        to select which ads to show, to cap how often you see the same ad, to detect
        fraudulent traffic, and to count impressions and clicks. Depending on your
        region and consent, some of this may be used for interest-based (personalised)
        advertising.
      </p>
      <p>
        We do not control Adsterra&apos;s systems and we do not receive the identifiers it
        sets. Its handling of your data is governed by its own privacy policy. Your
        browser settings control cookies for this site: you can block or delete them at
        any time, though blocking them may cause ads to be repeated or to fail to load.
      </p>

      <h2>Affiliate links</h2>
      <p>
        Some links on this site go to insurance quote providers and comparison partners
        who pay us a referral fee. When you click one of those links you leave{' '}
        {site.name}. The destination site sets its own cookies, records the referral, and
        collects whatever information you then choose to give it — which, for a quote
        form, is typically your name, address, date of birth, vehicle and driving
        history.
      </p>
      <p>
        We never pre-fill those forms with your data and we never pass your details to a
        partner, because we do not have your details. A referral identifier that
        identifies this site as the source of the click may be appended to the link, and
        so may a ZIP code that you typed. Once you are on a partner&apos;s site, that
        partner&apos;s privacy policy applies, not this one. Read it before submitting
        anything.
      </p>

      <h2>Third-party links</h2>
      <p>
        We link to state Departments of Insurance, open data sources and other external
        references. We are not responsible for the content or the privacy practices of
        any site we link to.
      </p>

      <h2>How the information is used</h2>
      <ul>
        <li>To deliver the pages you request and keep the site available.</li>
        <li>To understand, in aggregate, which content is useful.</li>
        <li>To display advertising, which is how the site is funded.</li>
        <li>To attribute referrals to affiliate partners so we are paid for them.</li>
      </ul>
      <p>
        We do not sell your personal information for money. Note that under some state
        privacy laws, the sharing of identifiers with an advertising network for
        interest-based advertising is itself treated as a &ldquo;sale&rdquo; or
        &ldquo;share&rdquo;; see your rights below and the opt-out links in the next
        section.
      </p>

      <h2>Opting out of interest-based ads</h2>
      <ul>
        <li>
          <a href="https://youradchoices.com/" rel="nofollow noopener" target="_blank">
            youradchoices.com
          </a>{' '}
          — the Digital Advertising Alliance opt-out tool.
        </li>
        <li>
          <a
            href="https://optout.networkadvertising.org/"
            rel="nofollow noopener"
            target="_blank"
          >
            optout.networkadvertising.org
          </a>{' '}
          — the Network Advertising Initiative opt-out tool.
        </li>
        <li>
          Your browser&apos;s own settings: block third-party cookies, clear site data,
          or use a private window.
        </li>
        <li>
          On mobile, reset or limit the advertising identifier in your device settings
          (iOS: Privacy &amp; Security; Android: Ads).
        </li>
      </ul>
      <p>
        These opt-outs are stored as cookies or device settings, so they apply per
        browser and per device and are lost when you clear your cookies.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        This site is intended for adults shopping for car insurance. It is not directed
        at children under 13, and we do not knowingly collect personal information from
        anyone under 13. Since we collect no personal information from anyone, this is
        straightforward — but if you believe a child has provided information to us by
        email, write to {site.email} and we will delete it.
      </p>

      <h2>Your rights in California (CCPA / CPRA)</h2>
      <p>
        California residents have the right to know what personal information is
        collected about them, to request its deletion, to correct it, to opt out of its
        sale or sharing for cross-context behavioural advertising, and not to be
        discriminated against for exercising those rights.
      </p>
      <p>
        We hold no personal information about you to disclose, correct or delete — there
        is no account, no profile and no record of your calculator inputs. The categories
        of information collected by our advertising partner are identifiers, internet
        activity and coarse geolocation, collected for advertising purposes. To opt out
        of sharing for interest-based advertising, use the opt-out tools above or send a
        Global Privacy Control signal from your browser. You may also contact us at{' '}
        {site.email}, including through an authorised agent, and we will respond within
        the period the law requires.
      </p>

      <h2>Your rights in the EU and UK (GDPR)</h2>
      <p>
        If you are in the European Economic Area or the United Kingdom, you have the
        right to access the personal data held about you, to have it corrected or
        erased, to restrict or object to its processing, to data portability, and to
        withdraw consent where processing relies on consent. You may also complain to
        your national data protection authority.
      </p>
      <p>
        The legal bases we rely on are our legitimate interest in serving and securing
        the site (server logs), and your consent, where required, for advertising
        cookies. Because we hold no identifiable data about you, an access or erasure
        request to us will normally return nothing; requests concerning advertising
        identifiers should also be directed to the advertising network, which is the
        party that holds them. Data may be processed on servers in the United States and
        other countries.
      </p>

      <h2>Data security and retention</h2>
      <p>
        The site is served over HTTPS. We retain no user data ourselves, so there is no
        store of personal information for us to secure, breach or hand over. Server logs
        and advertising identifiers are retained by the respective providers under their
        own policies.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If the site&apos;s behaviour changes — a form is added, an analytics tool is
        installed, an ad partner is swapped — this policy will be updated and the date at
        the top will change. Continued use of the site after a change means you accept
        the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy, or a request under any of the rights above:{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <p>
        See also our <Link href="/terms/">terms of use</Link> and the{' '}
        <Link href="/methodology/">methodology</Link> behind the estimates on this site.
      </p>
    </article>
  )
}
