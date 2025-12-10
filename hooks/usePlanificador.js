// hooks/usePlanificador.js - Hook para manejo del estado del planificador
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planificadorAPI, turnosAPI } from '../utils/api';
import { useToast } from './useToast';

const VISTAS = {
  TURNOS: 'turnos',
  HORAS: 'horas',
  DINERO: 'acumulado',
  SEMANAL: 'semanal'
};

export const usePlanificador = (mes, anio, vista) => {
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();

  // Query para cargar planificador
  const { data: planificadorData, isLoading: loadingPlanificador, refetch: refetchPlanificador } = useQuery({
    queryKey: ['planificador', mes, anio, vista],
    queryFn: async () => {
      let response;
      if (vista === VISTAS.HORAS) {
        response = await planificadorAPI.cargarPlanificador(mes, anio);
      } else if (vista === VISTAS.DINERO) {
        response = await planificadorAPI.cargarPlanificadorDetallado(mes, anio, 'acumulado');
      } else {
        response = await planificadorAPI.cargarPlanificador(mes, anio);
      }
      return response.data;
    },
    enabled: !!mes && !!anio,
  });

  // Query para cargar totales (si aplica)
  const { data: totalesData, isLoading: loadingTotales } = useQuery({
    queryKey: ['totales', mes, anio, vista],
    queryFn: async () => {
      const campo = vista === VISTAS.HORAS ? 'horas' : 'acumulado';
      const response = await planificadorAPI.cargarTotales(mes, anio, campo);
      return response.data.totales;
    },
    enabled: (vista === VISTAS.HORAS || vista === VISTAS.DINERO) && !!mes && !!anio,
  });

  // Query para cargar turnos disponibles
  const { data: turnosData } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      const response = await turnosAPI.obtenerTodos();
      return response.data.turnos || [];
    },
  });

  // Mutation para actualizar turno
  const updateTurnoMutation = useMutation({
    mutationFn: async ({ mes, anio, fecha, nombreEmpleado, turno }) => {
      return await planificadorAPI.actualizarTurno(mes, anio, {
        fecha,
        nombreEmpleado,
        turno
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['planificador', mes, anio, vista]);
      queryClient.invalidateQueries(['totales', mes, anio, vista]);
      showSuccess('Turno actualizado');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Error al actualizar turno');
    }
  });

  const planificador = planificadorData?.success ? planificadorData : null;
  const totales = totalesData || null;
  const turnosDisponibles = turnosData || [];
  const loading = loadingPlanificador || loadingTotales;

  const actualizarTurno = useCallback(async (fecha, nombreEmpleado, turno) => {
    await updateTurnoMutation.mutateAsync({
      mes,
      anio,
      fecha,
      nombreEmpleado,
      turno
    });
  }, [mes, anio, updateTurnoMutation]);

  const recargar = useCallback(() => {
    queryClient.invalidateQueries(['planificador', mes, anio, vista]);
    queryClient.invalidateQueries(['totales', mes, anio, vista]);
  }, [queryClient, mes, anio, vista]);

  return {
    planificador,
    totales,
    turnosDisponibles,
    loading,
    actualizarTurno,
    recargar,
    isUpdating: updateTurnoMutation.isPending
  };
};

export { VISTAS };
