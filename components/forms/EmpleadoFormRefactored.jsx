// components/forms/EmpleadoFormRefactored.jsx - Ejemplo de formulario refactorizado con react-hook-form + Zod
// Este es un ejemplo de referencia para refactorizar formularios existentes
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { empleadosAPI } from '../../utils/api';

// Schema Zod (debe coincidir con backend)
const empleadoSchema = z.object({
  nombre: z.string()
    .trim()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),
  
  apellido: z.string()
    .trim()
    .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    .max(100, { message: 'El apellido no puede exceder 100 caracteres' }),
  
  mail: z.string()
    .email({ message: 'El email debe ser válido' })
    .min(1, { message: 'El email es obligatorio' }),
  
  fecha_ingreso: z.string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'La fecha debe tener formato DD/MM/YYYY' }),
  
  hora_normal: z.coerce.number()
    .int({ message: 'La hora normal debe ser un número entero' })
    .min(1, { message: 'La hora normal debe ser mayor a 0' }),
  
  dia_vacaciones: z.coerce.number()
    .int()
    .min(0)
    .default(0)
    .optional(),
  
  horas_vacaciones: z.coerce.number()
    .int()
    .min(0)
    .default(0)
    .optional(),
});

export default function EmpleadoFormRefactored({ 
  empleado, 
  onSuccess, 
  onCancel,
  fotoPreview,
  onFotoChange
}) {
  const methods = useForm({
    resolver: zodResolver(empleadoSchema),
    defaultValues: empleado || {
      nombre: '',
      apellido: '',
      mail: '',
      fecha_ingreso: '',
      hora_normal: 8,
      dia_vacaciones: 0,
      horas_vacaciones: 0,
    },
    mode: 'onBlur'
  });

  const { handleSubmit: formSubmit, isSubmitting } = useFormSubmit(
    async (data) => {
      // Construir FormData para enviar
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      const response = empleado
        ? await empleadosAPI.actualizar(empleado.id, formData)
        : await empleadosAPI.crear(formData);
      
      return response.data;
    },
    {
      successMessage: empleado ? 'Empleado actualizado exitosamente' : 'Empleado creado exitosamente',
      onSuccess: () => {
        methods.reset();
        if (onSuccess) onSuccess();
      }
    }
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(formSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            {...methods.register('hora_normal', { valueAsNumber: true })}
            label="Horas Normales"
            type="number"
            min="1"
            error={methods.formState.errors.hora_normal?.message}
            required
          />
          
          <Input
            {...methods.register('dia_vacaciones', { valueAsNumber: true })}
            label="Días de Vacaciones"
            type="number"
            min="0"
            error={methods.formState.errors.dia_vacaciones?.message}
          />
          
          <Input
            {...methods.register('horas_vacaciones', { valueAsNumber: true })}
            label="Horas de Vacaciones"
            type="number"
            min="0"
            error={methods.formState.errors.horas_vacaciones?.message}
          />
        </div>

        {/* Foto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foto de Perfil
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onFotoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {fotoPreview && (
            <div className="mt-2">
              <img
                src={fotoPreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-6">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="flex-1"
          >
            {empleado ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
