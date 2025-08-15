/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nuvexsell/core'],
  experimental: {
    appDir: true
  },
  images: {
    domains: [
      'localhost',
      'nuvexsell.com',
      'staging.nuvexsell.com'
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'
  }
}

module.exports = nextConfig