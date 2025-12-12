// validations/empleadoSchemas.js - Schemas Zod para validación en frontend
import { z } from 'zod';

// Schema para crear empleado
export const crearEmpleadoSchema = z.object({
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
  
  antiguedad: z.coerce.number()
    .int()
    .min(0)
    .default(0)
    .optional(),
  
  hora_normal: z.coerce.number({
    required_error: 'La tarifa por hora es obligatoria',
    invalid_type_error: 'La tarifa por hora debe ser un número'
  })
    .min(1, { message: 'La tarifa por hora debe ser mayor a 0' }),
  
  dia_vacaciones: z.coerce.number()
    .int()
    .min(0)
    .default(14)
    .optional(),
  
  horas_vacaciones: z.coerce.number()
    .int()
    .min(0)
    .default(0)
    .optional()
});

// Schema para actualizar empleado
export const actualizarEmpleadoSchema = z.object({
  nombre: z.string()
    .trim()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' })
    .optional(),
  
  apellido: z.string()
    .trim()
    .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    .max(100, { message: 'El apellido no puede exceder 100 caracteres' })
    .optional(),
  
  mail: z.string()
    .email({ message: 'El email debe ser válido' })
    .optional(),
  
  fecha_ingreso: z.string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'La fecha debe tener formato DD/MM/YYYY' })
    .optional(),
  
  antiguedad: z.coerce.number()
    .int()
    .min(0)
    .optional(),
  
  hora_normal: z.coerce.number()
    .min(1, { message: 'La tarifa por hora debe ser mayor a 0' })
    .optional(),
  
  dia_vacaciones: z.coerce.number()
    .int()
    .min(0)
    .optional(),
  
  horas_vacaciones: z.coerce.number()
    .int()
    .min(0)
    .optional(),
  
  aplicar_cambio_tarifa: z.enum(['retroactivo_mes', 'desde_hoy', 'proximo_mes']).optional()
}).refine((data) => {
  // Al menos un campo debe ser enviado
  return Object.keys(data).length > 0;
}, {
  message: 'Al menos un campo debe ser enviado para actualizar',
  path: ['_general']
});
