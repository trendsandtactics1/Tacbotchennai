/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/widget',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*' // In production, specify allowed domains
          }
        ]
      }
    ];
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  images: {
    domains: [
      'cdn.pixabay.com',
      'picsum.photos',
      'hdvkqosistjeknqzorcg.supabase.co'
    ]
  }
};

export default nextConfig;
