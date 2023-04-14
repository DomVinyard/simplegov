/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false,
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/groups/20",
        permanent: true,
      },
      {
        source: "/topic/:topic",
        destination: "/topic/:topic/20",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
