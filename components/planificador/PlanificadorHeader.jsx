// components/planificador/PlanificadorHeader.jsx - Header del planificador
import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiDownload, FiLoader } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];


export default function PlanificadorHeader({ 
  mesActual, 
  anioActual, 
  loading, 
  generandoPdf,
  onCambiarMes, 
  onCambiarMesDirecto,
  onCambiarAnio, 
  onRecargar,
  onDescargarPDF 
}) {
  // Detectar si es mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mesesOptions = MESES.map((mes, idx) => ({
    value: idx + 1,
    label: mes
  }));

  const aniosOptions = Array.from({ length: 11 }, (_, i) => 2020 + i).map((anio) => ({
    value: anio,
    label: anio.toString()
  }));

  return (
    <div className="card mb-4 sm:mb-6">
      <div className="flex flex-col gap-4 w-full">
        {/* Título */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Planificador
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Gestión de turnos mensuales
          </p>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto sm:justify-start">
          {/* Selector de mes/año con flechas */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 w-full sm:w-auto">
            {/* Flecha izquierda */}
            <button
              onClick={() => onCambiarMes(-1)}
              className="p-2 sm:p-2.5 md:p-3 rounded-lg bg-gray-50 dark:bg-ternary-dark hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 flex items-center justify-center"
              disabled={loading}
              title="Mes anterior"
              aria-label="Mes anterior"
            >
              <FiChevronLeft className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 flex-shrink-0" />
            </button>

            {/* Selects de mes y año */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-1 sm:flex-initial min-w-0">
              <div className="flex-1 sm:flex-initial sm:w-[140px] min-w-0">
                <CustomSelect
                  value={mesActual}
                  onChange={(e) => onCambiarMesDirecto(parseInt(e.target.value))}
                  disabled={loading}
                  options={mesesOptions}
                  containerClassName="mb-0"
                  className={`${isMobile ? 'text-[11px]' : 'text-sm sm:text-base'} font-semibold`}
                />
              </div>

              <div className="flex-1 sm:flex-initial sm:w-[100px] min-w-0">
                <CustomSelect
                  value={anioActual}
                  onChange={(e) => onCambiarAnio(parseInt(e.target.value))}
                  disabled={loading}
                  options={aniosOptions}
                  containerClassName="mb-0"
                  className={`${isMobile ? 'text-[11px]' : 'text-sm sm:text-base'} font-semibold`}
                />
              </div>
            </div>

            {/* Flecha derecha */}
            <button
              onClick={() => onCambiarMes(1)}
              className="p-2 sm:p-2.5 md:p-3 rounded-lg bg-gray-50 dark:bg-ternary-dark hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 flex items-center justify-center"
              disabled={loading}
              title="Mes siguiente"
              aria-label="Mes siguiente"
            >
              <FiChevronRight className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 flex-shrink-0" />
            </button>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2 sm:gap-2 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
            <button
              onClick={onRecargar}
              className="p-2 sm:p-2.5 md:p-3 rounded-lg bg-gray-50 dark:bg-ternary-dark hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 flex items-center justify-center"
              disabled={loading}
              title="Recargar"
              aria-label="Recargar"
            >
              <FiRefreshCw className={`text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 flex-shrink-0 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onDescargarPDF}
              disabled={generandoPdf}
              className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white transition-colors flex items-center gap-1.5 sm:gap-2 flex-shrink-0 font-medium text-sm sm:text-base shadow-sm whitespace-nowrap h-10 sm:h-11 md:h-12 disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] sm:min-w-[100px] justify-center"
              title={generandoPdf ? "Generando PDF..." : "Descargar PDF"}
              aria-label={generandoPdf ? "Generando PDF..." : "Descargar PDF"}
            >
              {generandoPdf ? (
                <>
                  <FiLoader className="text-base sm:text-lg md:text-xl flex-shrink-0 animate-spin" />
                  <span className="hidden sm:inline">Generando...</span>
                </>
              ) : (
                <>
                  <FiDownload className="text-base sm:text-lg md:text-xl flex-shrink-0" />
                  <span className="hidden sm:inline">PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
