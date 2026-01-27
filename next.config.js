// Configuración de Next.js
// En desarrollo: servidor normal (sin export estático)
// En build estático: usar BUILD_STATIC=true npm run build:static

const isStaticExport = process.env.BUILD_STATIC === 'true';
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Solo configurar export estático si BUILD_STATIC=true Y no es desarrollo
  ...(isStaticExport && !isDev ? {
    output: 'export',
    distDir: 'out',
  } : {}),
  
  // Desactivar optimización de imágenes solo para export estático
  images: {
    unoptimized: isStaticExport && !isDev,
  },

  // Trailing slash solo para export estático
  trailingSlash: isStaticExport && !isDev,

  // Configuración de encoding UTF-8
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
