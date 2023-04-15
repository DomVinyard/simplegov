/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false,
  },
  redirects: async () => [],
};

module.exports = nextConfig;
