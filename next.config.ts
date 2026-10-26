import type { NextConfig } from 'next'
import { withVercelToolbar } from '@vercel/toolbar/plugins/next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@tanstack/react-table',
    '@tanstack/table-core',
    '@tanstack/react-store',
    '@tanstack/store',
  ],
}

export default withVercelToolbar()(nextConfig)
