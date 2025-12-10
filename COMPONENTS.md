# COMPONENTS - Planificador Frontend

Documentación de componentes y hooks reutilizables del frontend.

**Ubicación base:** `/frontend/components/` y `/frontend/hooks/`

---

## Componentes UI

### Input

**Path:** `components/ui/Input.jsx`

Componente de input reutilizable con soporte para labels, errores y validación.

**Props:**
- `label` (string, optional): Etiqueta del input
- `error` (string, optional): Mensaje de error a mostrar
- `helperText` (string, optional): Texto de ayuda
- `className` (string, optional): Clases CSS adicionales
- Todas las props estándar de `<input>`

**Ejemplo de uso:**
```jsx
import Input from '../components/ui/Input';

<Input
  label="Email"
  type="email"
  name="email"
  error={errors.email?.message}
  required
/>
```

**Ejemplo con react-hook-form:**
```jsx
import { useForm } from 'react-hook-form';
import Input from '../components/ui/Input';

const { register, formState: { errors } } = useForm();

<Input
  {...register('email')}
  label="Email"
  type="email"
  error={errors.email?.message}
/>
```

---

### Button

**Path:** `components/ui/Button.jsx`

Componente de botón reutilizable con variantes y estados de carga.

**Props:**
- `variant` (string, optional): 'primary' | 'secondary' | 'danger' | 'success' | 'outline' (default: 'primary')
- `size` (string, optional): 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading` (boolean, optional): Muestra spinner de carga
- `disabled` (boolean, optional): Deshabilita el botón
- `className` (string, optional): Clases CSS adicionales
- Todas las props estándar de `<button>`

**Ejemplo de uso:**
```jsx
import Button from '../components/ui/Button';

<Button
  variant="primary"
  size="md"
  isLoading={isSubmitting}
  onClick={handleSubmit}
>
  Guardar
</Button>
```

---

### Modal

**Path:** `components/ui/Modal.jsx`

Componente modal reutilizable con animaciones y accesibilidad.

**Props:**
- `isOpen` (boolean, required): Controla si el modal está abierto
- `onClose` (function, required): Función para cerrar el modal
- `title` (string, optional): Título del modal
- `size` (string, optional): 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
- `showCloseButton` (boolean, optional): Mostrar botón de cerrar (default: true)
- `children` (ReactNode, required): Contenido del modal

**Ejemplo de uso:**
```jsx
import Modal from '../components/ui/Modal';
import { useModal } from '../hooks/useModal';

const { isOpen, open, close } = useModal();

<Modal
  isOpen={isOpen}
  onClose={close}
  title="Confirmar acción"
  size="md"
>
  <p>¿Estás seguro de realizar esta acción?</p>
  <Button onClick={close}>Cancelar</Button>
  <Button variant="danger" onClick={handleConfirm}>Confirmar</Button>
</Modal>
```

---

### Select

**Path:** `components/ui/Select.jsx`

Componente select reutilizable con soporte para labels y errores.

**Props:**
- `label` (string, optional): Etiqueta del select
- `error` (string, optional): Mensaje de error
- `helperText` (string, optional): Texto de ayuda
- `options` (array, required): Array de opciones (strings o objetos {value, label})
- `placeholder` (string, optional): Texto placeholder (default: 'Seleccionar...')
- `className` (string, optional): Clases CSS adicionales
- Todas las props estándar de `<select>`

**Ejemplo de uso:**
```jsx
import Select from '../components/ui/Select';

<Select
  label="Turno"
  name="turno"
  options={[
    { value: 'mañana', label: 'Mañana' },
    { value: 'tarde', label: 'Tarde' },
    { value: 'noche', label: 'Noche' }
  ]}
  error={errors.turno?.message}
/>
```

---

### ErrorBanner

**Path:** `components/ui/ErrorBanner.jsx`

Componente para mostrar errores globales con animaciones.

**Props:**
- `error` (string | object, optional): Error a mostrar (string o objeto con message/errors)
- `onDismiss` (function, optional): Función para cerrar el banner
- `className` (string, optional): Clases CSS adicionales

**Ejemplo de uso:**
```jsx
import ErrorBanner from '../components/ui/ErrorBanner';

<ErrorBanner
  error={error}
  onDismiss={() => setError(null)}
/>
```

---

### Spinner

**Path:** `components/ui/Spinner.jsx`

Componente spinner de carga reutilizable.

**Props:**
- `size` (string, optional): 'sm' | 'md' | 'lg' (default: 'md')
- `className` (string, optional): Clases CSS adicionales

**Ejemplo de uso:**
```jsx
import Spinner from '../components/ui/Spinner';

{isLoading && <Spinner size="md" />}
```

---

## Hooks

### useAuth

**Path:** `hooks/useAuth.js`

Hook para acceder al contexto de autenticación.

**Retorna:**
- Objeto con funciones y estado del contexto de autenticación

**Ejemplo de uso:**
```jsx
import { useAuth } from '../hooks/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();
```

---

### useToast

**Path:** `hooks/useToast.js`

Hook para mostrar notificaciones toast.

**Retorna:**
- `showSuccess(message)`: Muestra toast de éxito
- `showError(message)`: Muestra toast de error
- `showInfo(message)`: Muestra toast informativo
- `showLoading(message)`: Muestra toast de carga (retorna ID para dismiss)
- `dismiss(toastId)`: Cierra un toast específico

**Ejemplo de uso:**
```jsx
import { useToast } from '../hooks/useToast';

const { showSuccess, showError } = useToast();

const handleSave = async () => {
  try {
    await saveData();
    showSuccess('Datos guardados exitosamente');
  } catch (error) {
    showError('Error al guardar datos');
  }
};
```

---

### useFormSubmit

**Path:** `hooks/useFormSubmit.js`

Hook para manejo de envío de formularios con estados de carga y errores.

**Parámetros:**
- `submitFn` (function, required): Función async que ejecuta el submit
- `options` (object, optional):
  - `successMessage` (string): Mensaje de éxito
  - `errorMessage` (string): Mensaje de error por defecto
  - `onSuccess` (function): Callback al éxito
  - `onError` (function): Callback al error

**Retorna:**
- `handleSubmit(data)`: Función para manejar el submit
- `isSubmitting` (boolean): Estado de carga
- `error` (string | null): Error actual
- `setError` (function): Función para establecer error manualmente

**Ejemplo de uso:**
```jsx
import { useFormSubmit } from '../hooks/useFormSubmit';
import { useForm } from 'react-hook-form';

const { handleSubmit: formSubmit, isSubmitting, error } = useFormSubmit(
  async (data) => {
    const response = await api.createEmpleado(data);
    return response.data;
  },
  {
    successMessage: 'Empleado creado exitosamente',
    onSuccess: () => router.push('/empleados'),
  }
);

const { handleSubmit, register } = useForm();

<form onSubmit={handleSubmit(formSubmit)}>
  {/* campos del formulario */}
  <Button type="submit" isLoading={isSubmitting}>
    Guardar
  </Button>
</form>
```

---

### useModal

**Path:** `hooks/useModal.js`

Hook para manejo de estado de modales.

**Parámetros:**
- `initialState` (boolean, optional): Estado inicial (default: false)

**Retorna:**
- `isOpen` (boolean): Estado actual
- `open()`: Función para abrir
- `close()`: Función para cerrar
- `toggle()`: Función para alternar

**Ejemplo de uso:**
```jsx
import { useModal } from '../hooks/useModal';
import Modal from '../components/ui/Modal';

const { isOpen, open, close } = useModal();

<Button onClick={open}>Abrir Modal</Button>
<Modal isOpen={isOpen} onClose={close} title="Mi Modal">
  Contenido del modal
</Modal>
```

---

## Ejemplo Completo: Formulario con react-hook-form + Zod

**Path:** `components/forms/EmpleadoForm.jsx` (ejemplo)

```jsx
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { empleadoAPI } from '../../utils/api';

// Schema Zod (debe coincidir con backend)
const empleadoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  mail: z.string().email('Email inválido'),
  fecha_ingreso: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato inválido DD/MM/YYYY'),
  hora_normal: z.coerce.number().int().min(1, 'Debe ser mayor a 0'),
});

export default function EmpleadoForm({ empleado, onSuccess }) {
  const methods = useForm({
    resolver: zodResolver(empleadoSchema),
    defaultValues: empleado || {
      nombre: '',
      apellido: '',
      mail: '',
      fecha_ingreso: '',
      hora_normal: 8,
    },
  });

  const { handleSubmit: formSubmit, isSubmitting } = useFormSubmit(
    async (data) => {
      const response = empleado
        ? await empleadoAPI.actualizar(empleado.id, data)
        : await empleadoAPI.crear(data);
      return response.data;
    },
    {
      successMessage: empleado ? 'Empleado actualizado' : 'Empleado creado',
      onSuccess,
    }
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(formSubmit)}>
        <Input
          {...methods.register('nombre')}
          label="Nombre"
          error={methods.formState.errors.nombre?.message}
          required
        />
        
        <Input
          {...methods.register('apellido')}
          label="Apellido"
          error={methods.formState.errors.apellido?.message}
          required
        />
        
        <Input
          {...methods.register('mail')}
          label="Email"
          type="email"
          error={methods.formState.errors.mail?.message}
          required
        />
        
        <Input
          {...methods.register('fecha_ingreso')}
          label="Fecha de Ingreso"
          placeholder="DD/MM/YYYY"
          error={methods.formState.errors.fecha_ingreso?.message}
          required
        />
        
        <Input
          {...methods.register('hora_normal', { valueAsNumber: true })}
          label="Horas Normales"
          type="number"
          error={methods.formState.errors.hora_normal?.message}
          required
        />
        
        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {empleado ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
```

---

## Componentes Existentes (Legacy)

### Layout

**Path:** `components/Layout.jsx`

Layout principal de la aplicación con header y navegación.

### ProtectedRoute

**Path:** `components/ProtectedRoute.jsx`

Componente para proteger rutas que requieren autenticación.

### Loading

**Path:** `components/Loading.jsx`

Componente de carga (legacy, considerar usar Spinner).

### EmptyState

**Path:** `components/EmptyState.jsx`

Componente para mostrar estados vacíos.

### ShiftSelector

**Path:** `components/ShiftSelector.jsx`

Selector de turnos (específico del planificador).

### WeeklyView

**Path:** `components/WeeklyView.jsx`

Vista semanal del planificador.

---

## Convenciones

1. **Nombres:** PascalCase para componentes, camelCase para hooks
2. **Props:** Usar TypeScript o PropTypes cuando sea posible
3. **Accesibilidad:** Incluir atributos ARIA cuando corresponda
4. **Errores:** Mostrar errores inline en formularios
5. **Estados de carga:** Usar `isLoading` o `isSubmitting` consistentemente
6. **Validación:** Usar Zod schemas compartidos con backend

---

**Última actualización:** 2025-01-09
