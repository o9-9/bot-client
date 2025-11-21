/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.discordapp.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'discord.js': false,
        '@discordjs/ws': false,
        '@discordjs/rest': false,
        '@discordjs/voice': false,
      }
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'zlib-sync': false,
        'bufferutil': false,
        'utf-8-validate': false,
        'erlpack': false,
      }
    }
    config.externals = [...(config.externals || []), 'zlib-sync', 'bufferutil', 'utf-8-validate']
    return config
  },
}

module.exports = nextConfig
