/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('mysql2')
    }
    return config
  },
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
