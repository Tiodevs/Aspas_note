import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Configuração para hot reload funcionar no Docker
  ...(process.env.NODE_ENV === 'development' && {
    // Configuração do webpack para polling no Docker
    webpackDevMiddleware: (config: any) => {
      config.watchOptions = {
        poll: 1000, // Verifica mudanças a cada segundo
        aggregateTimeout: 300, // Espera 300ms após mudanças antes de recompilar
        ignored: /node_modules/,
      };
      return config;
    },
    // Configuração adicional do webpack para watch funcionar no Docker
    webpack: (config: any, { dev }: { dev: boolean }) => {
      if (dev) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
          ignored: /node_modules/,
        };
      }
      return config;
    },
    experimental: {
      serverActions: {
        bodySizeLimit: '2mb',
      },
    },
  }),
};

export default nextConfig;
