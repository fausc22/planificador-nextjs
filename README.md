# Frontend - Sistema de Planificación de Empleados

> **Nota:** Para información completa del proyecto, ver el [README principal](../README.md)

Frontend desarrollado en **Next.js con JavaScript** y **Tailwind CSS** para el sistema de planificación de empleados.

**Versión:** 2.0.0 - Refactorizado con componentes modulares, React Query y sincronización de URL

---

## 🚀 Inicio Rápido

### Instalación

```bash
cd frontend
npm install
```

### Configuración

```bash
# El archivo .env.local ya está configurado con:
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3001` (o el puerto que Next.js asigne)

### Producción

```bash
npm run build
npm start
```

---

## 📁 Estructura del Proyecto

```
frontend/
├── pages/                    # Páginas (Router clásico)
│   ├── _app.jsx             # Configuración global
│   ├── _document.jsx        # HTML base
│   ├── index.jsx            # Página de inicio
│   ├── login.jsx            # Login
│   ├── dashboard.jsx        # Dashboard principal
│   ├── empleados/
│   │   ├── index.jsx        # Lista de empleados
│   │   └── nuevo.jsx        # Crear empleado
│   ├── planificador/
│   │   └── index.jsx        # Planificador mensual
│   ├── turnos/
│   │   └── index.jsx        # Gestión de turnos
│   ├── vacaciones/
│   │   └── index.jsx        # Gestión de vacaciones
│   ├── control-horas/
│   │   └── index.jsx        # Control de horas
│   ├── recibos/
│   │   └── index.jsx        # Recibos de sueldo
│   ├── 404.jsx              # Error 404
│   └── 500.jsx              # Error 500
│
├── components/              # Componentes reutilizables
│   ├── Layout.jsx           # Layout principal con sidebar
│   ├── Loading.jsx          # Componente de carga
│   └── EmptyState.jsx       # Estado vacío
│
├── context/                 # React Context
│   ├── AuthContext.jsx      # Contexto de autenticación
│   └── ThemeContext.jsx     # Contexto de tema claro/oscuro
│
├── utils/                   # Utilidades
│   ├── api.js               # Cliente HTTP (Axios)
│   ├── fechas.js            # Funciones de fechas
│   └── format.js            # Formateo de datos
│
├── styles/                  # Estilos
│   └── globals.css          # Estilos globales con Tailwind
│
├── public/                  # Archivos estáticos
│   └── favicon.ico
│
├── next.config.js           # Configuración de Next.js
├── tailwind.config.js       # Configuración de Tailwind
├── postcss.config.js        # Configuración de PostCSS
└── jsconfig.json            # Paths de JavaScript
```

---

## ⚙️ Tecnologías Utilizadas

- **Next.js 15.3** - Framework React
- **React 18.3** - Biblioteca UI
- **Tailwind CSS 3.4** - Estilos
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificaciones
- **React Icons** - Iconos
- **HeroUI** - Componentes UI
- **PrimeReact** - Componentes adicionales
- **Framer Motion** - Animaciones
- **Recharts** - Gráficos

---

## 🎨 Características

### ✅ Implementadas

- ✅ **Autenticación JWT** con refresh token
- ✅ **Tema claro/oscuro** con persistencia
- ✅ **Layout responsivo** con sidebar colapsable
- ✅ **Navegación** entre módulos
- ✅ **Dashboard** con estadísticas
- ✅ **Gestión de empleados** con paginación
- ✅ **Planificador mensual** con navegación
- ✅ **Gestión de turnos** y horarios
- ✅ **Control de vacaciones**
- ✅ **Páginas de error** (404, 500)
- ✅ **Loading states** y spinners
- ✅ **Toasts** para notificaciones

### 🔄 Conexión con Backend

El frontend se conecta automáticamente al backend en `http://localhost:3000/api`

Configuración en:
- `.env.local` - Variable `NEXT_PUBLIC_API_URL`
- `utils/api.js` - Cliente Axios configurado

---

## 🎯 Páginas Disponibles

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/` | Redirige según autenticación | ✅ |
| `/login` | Inicio de sesión | ✅ |
| `/dashboard` | Panel principal | ✅ |
| `/empleados` | Lista de empleados | ✅ |
| `/empleados/nuevo` | Crear empleado | ✅ |
| `/planificador` | Vista del planificador | ✅ |
| `/turnos` | Gestión de turnos | ✅ |
| `/vacaciones` | Gestión de vacaciones | ✅ |
| `/control-horas` | Control de horas | ✅ |
| `/recibos` | Recibos de sueldo | ✅ |

---

## 🔐 Autenticación

El sistema usa JWT almacenado en `localStorage`:

```javascript
// Login
const { token, refreshToken, empleado } = await authAPI.login(username, password);
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(empleado));

// Las requests automáticamente incluyen el token
// Configurado en utils/api.js con interceptors de Axios
```

### Refresh Token Automático

Si el token expira, el sistema automáticamente:
1. Intenta renovarlo con el `refreshToken`
2. Si falla, redirige al login

---

## 🎨 Tema Claro/Oscuro

```javascript
// Usar el hook
import { useTheme } from '../context/ThemeContext';

const { theme, toggleTheme, isDark } = useTheme();

// Cambiar tema
<button onClick={toggleTheme}>Cambiar Tema</button>
```

El tema se guarda en `localStorage` y persiste entre sesiones.

---

## 🛠️ Componentes Personalizados

### Layout
```jsx
import Layout from '../components/Layout';

<Layout>
  {/* Tu contenido aquí */}
</Layout>
```

### Loading
```jsx
import Loading from '../components/Loading';

<Loading text="Cargando empleados..." />
```

### EmptyState
```jsx
import EmptyState from '../components/EmptyState';
import { FiUsers } from 'react-icons/fi';

<EmptyState
  icon={FiUsers}
  title="No hay empleados"
  description="Comienza agregando tu primer empleado"
  action={<button>Agregar Empleado</button>}
/>
```

---

## 🎯 Uso de la API

```javascript
import { empleadosAPI, planificadorAPI } from '../utils/api';

// Obtener empleados (con paginación)
const response = await empleadosAPI.obtenerTodos({ page: 1, limit: 20 });

// Cargar planificador
const planificador = await planificadorAPI.cargarPlanificador(1, 2024);

// Crear empleado
await empleadosAPI.crear({
  nombre: 'Juan',
  apellido: 'Pérez',
  mail: 'juan@example.com',
  // ... más datos
});
```

---

## 🎨 Estilos con Tailwind

### Clases Personalizadas Creadas

```html
<!-- Botones -->
<button className="btn-primary">Primario</button>
<button className="btn-secondary">Secundario</button>
<button className="btn-success">Éxito</button>
<button className="btn-danger">Peligro</button>

<!-- Cards -->
<div className="card">Contenido</div>

<!-- Inputs -->
<input className="input" />

<!-- Containers -->
<div className="container-custom">Contenido centrado</div>

<!-- Turnos -->
<div className="turno-libre">Libre</div>
<div className="turno-manana">Mañana</div>
<div className="turno-tarde">Tarde</div>
<div className="turno-noche">Noche</div>
```

### Modo Oscuro

Usa el prefijo `dark:` para estilos en modo oscuro:

```html
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Contenido
</div>
```

---

## 📱 Responsividad

El sistema es completamente responsivo usando breakpoints de Tailwind:

```html
<!-- Mobile first -->
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- En mobile: 1 columna -->
  <!-- En tablet (md): 2 columnas -->
  <!-- En desktop (lg): 3 columnas -->
</div>
```

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Linter
npm run lint

# Limpiar
npm run clean

# Reinstalar dependencias
npm run reinstall
```

---

## 🚀 Despliegue

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📝 Próximos Pasos

### Funcionalidades a Desarrollar
- [ ] Edición de empleados
- [ ] Edición inline del planificador
- [ ] Modal para asignar turnos
- [ ] Filtros avanzados
- [ ] Exportación a PDF/Excel
- [ ] Gráficos y estadísticas
- [ ] Notificaciones en tiempo real
- [ ] Sistema de permisos por rol

### Mejoras Técnicas
- [ ] Tests con Jest/React Testing Library
- [ ] Storybook para componentes
- [ ] Optimización de imágenes
- [ ] Service Workers (PWA en futuro)
- [ ] Lazy loading de componentes

---

## 🐛 Troubleshooting

### Error: Cannot connect to API
```bash
# Verificar que el backend esté corriendo
curl http://localhost:3000/health

# Verificar NEXT_PUBLIC_API_URL en .env.local
```

### Error: Module not found
```bash
npm install
```

### Puerto en uso
```bash
# Next.js usará automáticamente el siguiente puerto disponible
# O especifica uno manualmente:
PORT=3001 npm run dev
```

---

## 📚 Documentación Adicional

- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Icons**: https://react-icons.github.io/react-icons/
- **Axios**: https://axios-http.com/docs/intro

---

## ✨ Conclusión

Frontend moderno y responsivo, listo para conectar con tu backend optimizado.

**Características**:
- ✅ JavaScript puro (sin TypeScript)
- ✅ Rutas clásicas con pages/
- ✅ Tailwind CSS configurado
- ✅ Tema claro/oscuro
- ✅ 100% responsivo
- ✅ Conexión con backend lista

**¡Listo para desarrollar!** 🚀

