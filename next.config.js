/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // بهینه‌سازی برای کاهش حجم
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fns'
    ],
    // کاهش حافظه مصرفی
    workerThreads: false,
  },
  // SWC minification
  swcMinify: true,
  // حذف source maps در production
  productionBrowserSourceMaps: false,
  // تنظیمات performance
  poweredByHeader: false,
  reactStrictMode: false,
  // کاهش حجم bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Standalone output برای Docker
  output: 'standalone',
  webpack: (config, { isServer, dev }) => {
    // کاهش حافظه webpack
    config.optimization = {
      ...config.optimization,
      minimize: !dev,
      // حذف usedExports به دلیل تداخل با cacheUnaffected در webpack
      // usedExports: true,
      // sideEffects: false,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      },
    };

    // کاهش parallelism برای کاهش مصرف حافظه
    config.parallelism = 1;
    
    // CommonJS support
    config.experiments = { ...config.experiments, topLevelAwait: true };

    return config;
  },
};

export default nextConfig;