import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Pure static output: every one of the ~3,800 pages is prebuilt HTML, so the
  // whole site runs on Cloudflare Pages for $0 with no server to keep alive.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  compress: true,
}

export default nextConfig
