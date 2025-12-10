// components/planificador/PlanificadorHeader.jsx - Header del planificador
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiDownload } from 'react-icons/fi';
import Select from '../ui/Select';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function PlanificadorHeader({ 
  mesActual, 
  anioActual, 
  loading, 
  onCambiarMes, 
  onCambiarMesDirecto,
  onCambiarAnio, 
  onRecargar,
  onDescargarPDF 
}) {
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
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Planificador
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Gestión de turnos mensuales
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => onCambiarMes(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors flex-shrink-0"
              disabled={loading}
              title="Mes anterior"
            >
              <FiChevronLeft className="text-lg sm:text-xl" />
            </button>

            <div className="flex flex-1 sm:flex-initial items-center gap-2 min-w-0">
              <div className="flex-1 sm:flex-initial sm:min-w-[140px]">
                <Select
                  value={mesActual}
                  onChange={(e) => onCambiarMesDirecto(parseInt(e.target.value))}
                  disabled={loading}
                  options={mesesOptions}
                  containerClassName="mb-0"
                  className="text-sm sm:text-base font-semibold"
                />
              </div>

              <div className="flex-1 sm:flex-initial sm:min-w-[100px]">
                <Select
                  value={anioActual}
                  onChange={(e) => onCambiarAnio(parseInt(e.target.value))}
                  disabled={loading}
                  options={aniosOptions}
                  containerClassName="mb-0"
                  className="text-sm sm:text-base font-semibold"
                />
              </div>
            </div>

            <button
              onClick={() => onCambiarMes(1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors flex-shrink-0"
              disabled={loading}
              title="Mes siguiente"
            >
              <FiChevronRight className="text-lg sm:text-xl" />
            </button>

            <button
              onClick={onRecargar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors flex-shrink-0"
              disabled={loading}
              title="Recargar"
            >
              <FiRefreshCw className={`text-lg sm:text-xl ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onDescargarPDF}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors flex items-center gap-2 flex-shrink-0"
              title="Descargar PDF"
            >
              <FiDownload className="text-lg sm:text-xl" />
              <span className="hidden sm:inline text-sm">PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
