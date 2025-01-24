import type { NextConfig } from 'next'
import { withVercelToolbar } from '@vercel/toolbar/plugins/next'

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
    dynamicIO: true,
  },
}

export default withVercelToolbar()(nextConfig)
