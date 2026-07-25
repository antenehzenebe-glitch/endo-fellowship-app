/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Landing photography is hosted externally (see LANDING_IMAGES in
    // components/Landing.tsx) — allow next/image to optimize it.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.kimi.com',
      },
    ],
  },
}

module.exports = nextConfig
