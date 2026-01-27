# Solución Error Turbopack

## Problema
Error: `__turbopack_load_page_chunks__ is not defined`

## Causa
El navegador está intentando cargar archivos de un build estático anterior desde `/out` en lugar del servidor de desarrollo.

## Solución

### 1. Detener el servidor de desarrollo
Presiona `Ctrl+C` en la terminal donde corre `npm run dev`

### 2. Limpiar completamente
```bash
cd frontend
rm -rf .next out node_modules/.cache
```

### 3. Limpiar caché del navegador

**Chrome/Edge:**
- Presiona `Ctrl+Shift+Delete` (Windows/Linux) o `Cmd+Shift+Delete` (Mac)
- Selecciona "Caché" o "Cached images and files"
- Marca "Todo el tiempo"
- Click en "Borrar datos"

**O más rápido:**
- Abre DevTools (F12)
- Click derecho en el botón de recargar
- Selecciona "Vaciar caché y recargar de forma forzada"

**Firefox:**
- Presiona `Ctrl+Shift+Delete`
- Selecciona "Caché"
- Click en "Limpiar ahora"

### 4. Reiniciar el servidor
```bash
npm run dev
```

### 5. Abrir en modo incógnito (alternativa)
Si el problema persiste, abre el navegador en modo incógnito:
- Chrome: `Ctrl+Shift+N` (Windows) o `Cmd+Shift+N` (Mac)
- Firefox: `Ctrl+Shift+P` (Windows) o `Cmd+Shift+P` (Mac)

Luego navega a `http://localhost:3000`

## Verificación

Si todo está bien, deberías ver:
- El servidor corriendo en `http://localhost:3000`
- Sin errores en la consola del navegador
- La página de login cargando correctamente

## Si el problema persiste

1. Verifica que no hay procesos de Node corriendo:
```bash
lsof -ti:3000 | xargs kill -9
```

2. Reinstala dependencias:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

3. Verifica que la configuración está correcta:
```bash
cat next.config.js
```

No debe tener `output: 'export'` ni `distDir: 'out'` cuando corres `npm run dev`
