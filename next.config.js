/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // LE FIX EST ICI : on autorise 'unsafe-eval'
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co https://js.stripe.com; object-src 'none';",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
