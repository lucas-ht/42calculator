import withBundleAnalyzer from '@next/bundle-analyzer'

const config = {
  enabled: process.env.ANALYZE === 'true',
}

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default withBundleAnalyzer(config)(nextConfig)
