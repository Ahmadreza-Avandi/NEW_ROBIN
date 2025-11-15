/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // این گزینه خطاهای TypeScript را در زمان build نادیده می‌گیرد
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:5000';
    
    const rewrites = [];
    
    // فقط در حالت production (Docker) از rewrites استفاده می‌شود
    if (process.env.NODE_ENV === 'production') {
      rewrites.push(
        {
          source: '/phpmyadmin',
          destination: 'http://phpmyadmin:80',
        },
        {
          source: '/phpmyadmin/:path*',
          destination: 'http://phpmyadmin:80/:path*',
        }
      );
    }
    
    // Python API rewrite
    rewrites.push({
      source: '/python-api/:path*',
      destination: `${pythonUrl}/:path*`,
    });
    
    return rewrites;
  }
}

export default nextConfig;
