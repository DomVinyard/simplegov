/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false,
  },
  output: "standalone",
  swcMinify: false,
  redirects: async () => [],
};

module.exports = nextConfig;
