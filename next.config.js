/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Landing photography is served from the project's public Supabase
    // Storage bucket (see LANDING_IMAGES in components/Landing.tsx) —
    // allow next/image to optimize it.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xousmzkftledlkwtpavb.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
