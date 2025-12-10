const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Configuración para build estático (carpeta out/)
  output: 'export',
  distDir: 'out',
  
  // Desactivar optimización de imágenes para export estático
  images: {
    unoptimized: true,
  },

  // Trailing slash para compatibilidad con servidores estáticos
  trailingSlash: true,

  // Configuración de encoding UTF-8
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
