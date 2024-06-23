// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {}

/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-expect-error 1234567890
const withVercelToolbar = require('@vercel/toolbar/plugins/next')()
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withVercelToolbar(
  withBundleAnalyzer(nextConfig)
)
