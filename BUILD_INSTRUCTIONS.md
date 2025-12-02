# 📦 Instrucciones para Build Estático

## 1. Generar el build estático

```bash
cd frontend
npm run build
```

Esto generará la carpeta `out/` con todos los archivos estáticos.

## 2. Estructura de la carpeta `out/`

```
out/
├── _next/           # Assets de Next.js (JS, CSS, imágenes)
├── asistencia/      # Página de asistencia
├── dashboard/       # Dashboard
├── empleados/       # Gestión de empleados
├── logueos/         # Panel de logueos
├── login/           # Login
├── index.html       # Página principal
└── ...              # Otras páginas
```

## 3. Subir al servidor VPS

### Opción A: Via FTP/SFTP
1. Conecta a tu servidor via FTP/SFTP
2. Sube todo el contenido de la carpeta `out/` a tu directorio web (ej: `/var/www/html/planificador/`)

### Opción B: Via SCP
```bash
scp -r out/* usuario@tu-servidor.com:/var/www/html/planificador/
```

### Opción C: Via rsync (recomendado)
```bash
rsync -avz --delete out/ usuario@tu-servidor.com:/var/www/html/planificador/
```

## 4. Configuración del servidor web

### Para Apache (.htaccess)

Crea un archivo `.htaccess` en el directorio raíz:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /planificador/
  
  # Redirigir todo a index.html para SPA routing
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /planificador/index.html [L]
</IfModule>

# Habilitar CORS
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Cache para assets estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
</IfModule>
```

### Para Nginx

Agrega a tu configuración de Nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/html/planificador;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy para API (opcional, si quieres usar /api en vez de mycarrito.com.ar)
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 5. Variables de entorno

El build usa las variables de `.env.production`:

```
NEXT_PUBLIC_API_URL=https://mycarrito.com.ar/api/planificador
```

Si necesitas cambiar la URL de la API después del build, tendrás que:
1. Modificar `.env.production`
2. Volver a ejecutar `npm run build`
3. Subir nuevamente la carpeta `out/`

## 6. Verificar el build

Después de subir los archivos, verifica:

1. ✅ Página principal carga: `https://tu-dominio.com/planificador/`
2. ✅ Login funciona: `https://tu-dominio.com/planificador/login/`
3. ✅ Asistencia pública: `https://tu-dominio.com/planificador/asistencia/`
4. ✅ API responde: Abre la consola del navegador y verifica que las peticiones a `https://mycarrito.com.ar/api/planificador` funcionan

## 7. Troubleshooting

### Problema: "404 Not Found" al recargar páginas
**Solución**: Configura correctamente el `.htaccess` o Nginx para redirigir todo a `index.html`

### Problema: "CORS error"
**Solución**: Verifica que el backend tenga configurado CORS para permitir tu dominio

### Problema: "API URL incorrecta"
**Solución**: Verifica `.env.production` y vuelve a hacer build

### Problema: Imágenes no cargan
**Solución**: Verifica que `images.unoptimized: true` esté en `next.config.js`

## 8. Actualizar el sitio

Para actualizar después de hacer cambios:

```bash
cd frontend
npm run build
rsync -avz --delete out/ usuario@servidor:/var/www/html/planificador/
```

## 9. Comparación: Vercel vs Build Estático

| Característica | Vercel | Build Estático VPS |
|----------------|--------|-------------------|
| Velocidad | ⚡ Muy rápido (CDN global) | 🚀 Rápido (servidor único) |
| Costo | 💰 Gratis (hobby) | 💵 Incluido en VPS |
| Deploy | 🔄 Automático (git push) | 📤 Manual (FTP/SCP) |
| API Routes | ✅ Soportado | ❌ No (usar backend directo) |
| SSR/ISR | ✅ Soportado | ❌ No (solo estático) |
| Control | 🔒 Limitado | 🔓 Total |

## 10. Recomendación

Para tu caso, donde el backend ya está en el VPS, el **build estático en el VPS** es ideal porque:
- ✅ Todo en un solo servidor (frontend + backend)
- ✅ Sin problemas de CORS
- ✅ Sin límites de Vercel
- ✅ Más rápido (sin proxy entre Vercel y VPS)

