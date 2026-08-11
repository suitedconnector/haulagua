/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client'],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "streetviewpixels-pa.googleapis.com" },
      { protocol: "https", hostname: "haulagua.onrender.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: '/find',
        destination: '/search',
        permanent: true,
      },
      // ── Legacy hauler slugs ─────────────────────────────────────────────
      // Businesses still in haulers-flat.json under a different slug.
      // Orphaned by the Strapi migration (76784d4) and the Apr 30 data
      // refresh (ae16eda), which replaced 20 records without redirects.
      // Verified 2026-08-10: every destination exists, no source collides
      // with a live slug. Do not remove — these are indexed URLs.
      ...Object.entries({
        'water-runner': 'water-runner-llc',
        'h2eco-water-llc': 'h2eco-water',
        'all-about-water': 'all-about-water-llc',
        'wendys-water-truck-company': 'wendys-water-truck-co',
        'southwest-water-tanks': 'southwest-water-truck',
        'hydro-haulers-bulk-water-delivery': 'hydro-haulers-bulk-water',
        // slug was generated from the `website` field instead of `name`
        'flynnwater.com': 'flynn-water',
      }).map(([from, to]) => ({
        source: `/haulers/${from}`,
        destination: `/haulers/${to}`,
        permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
}

export default nextConfig
