/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  images: {
    domains: ['cdn.pixabay.com', 'picsum.photos']
  }
};

export default nextConfig;
