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

  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
