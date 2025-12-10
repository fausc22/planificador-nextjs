// hooks/usePlanificadorFilters.js - Hook para sincronizar filtros con URL usando Next.js router
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export const usePlanificadorFilters = () => {
  const router = useRouter();
  const fechaActual = new Date();
  
  // Obtener valores de la URL o usar defaults
  const mesFromUrl = router.query.mes ? parseInt(router.query.mes) : null;
  const anioFromUrl = router.query.anio ? parseInt(router.query.anio) : null;
  const vistaFromUrl = router.query.vista || null;
  
  const [mes, setMesState] = useState(mesFromUrl || fechaActual.getMonth() + 1);
  const [anio, setAnioState] = useState(anioFromUrl || fechaActual.getFullYear());
  const [vista, setVistaState] = useState(vistaFromUrl || 'turnos');

  // Sincronizar con URL cuando cambia router.query (solo al cargar o cuando cambia la URL externamente)
  useEffect(() => {
    if (router.isReady) {
      if (mesFromUrl !== null && mesFromUrl !== mes) {
        setMesState(mesFromUrl);
      }
      if (anioFromUrl !== null && anioFromUrl !== anio) {
        setAnioState(anioFromUrl);
      }
      if (vistaFromUrl && vistaFromUrl !== vista) {
        setVistaState(vistaFromUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.mes, router.query.anio, router.query.vista]);

  // Función para actualizar la URL sin recargar la página
  const updateUrl = useCallback((updates) => {
    const newQuery = { ...router.query, ...updates };
    router.replace(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  }, [router]);

  const setMes = useCallback((nuevoMes) => {
    setMesState(nuevoMes);
    updateUrl({ mes: nuevoMes.toString() });
  }, [updateUrl]);

  const setAnio = useCallback((nuevoAnio) => {
    setAnioState(nuevoAnio);
    updateUrl({ anio: nuevoAnio.toString() });
  }, [updateUrl]);

  const setVista = useCallback((nuevaVista) => {
    setVistaState(nuevaVista);
    updateUrl({ vista: nuevaVista });
  }, [updateUrl]);

  const cambiarMes = useCallback((direccion) => {
    if (direccion === null || direccion === undefined) return;
    
    let nuevoMesCalculado = mes + direccion;
    let nuevoAnioCalculado = anio;

    if (nuevoMesCalculado > 12) {
      nuevoMesCalculado = 1;
      nuevoAnioCalculado++;
    } else if (nuevoMesCalculado < 1) {
      nuevoMesCalculado = 12;
      nuevoAnioCalculado--;
    }

    setMes(nuevoMesCalculado);
    if (nuevoAnioCalculado !== anio) {
      setAnio(nuevoAnioCalculado);
    }
  }, [mes, anio, setMes, setAnio]);

  const cambiarMesDirecto = useCallback((nuevoMes) => {
    if (nuevoMes < 1 || nuevoMes > 12) return;
    setMes(nuevoMes);
  }, [setMes]);

  const cambiarAnio = useCallback((nuevoAnio) => {
    setAnio(nuevoAnio);
  }, [setAnio]);

  const cambiarVista = useCallback((nuevaVista) => {
    setVista(nuevaVista);
  }, [setVista]);

  return {
    mes,
    anio,
    vista,
    cambiarMes,
    cambiarMesDirecto,
    cambiarAnio,
    cambiarVista
  };
};
