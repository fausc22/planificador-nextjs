// components/planificador/PlanificadorHeader.jsx - Header del planificador
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiDownload } from 'react-icons/fi';

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
  return (
    <div className="card mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Planificador
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestión de turnos mensuales
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onCambiarMes(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors"
              disabled={loading}
              title="Mes anterior"
            >
              <FiChevronLeft className="text-xl" />
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={mesActual}
                onChange={(e) => onCambiarMesDirecto(parseInt(e.target.value))}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-secondary-dark text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                {MESES.map((mes, idx) => (
                  <option key={idx} value={idx + 1}>
                    {mes}
                  </option>
                ))}
              </select>

              <select
                value={anioActual}
                onChange={(e) => onCambiarAnio(parseInt(e.target.value))}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-secondary-dark text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onCambiarMes(1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors"
              disabled={loading}
              title="Mes siguiente"
            >
              <FiChevronRight className="text-xl" />
            </button>

            <button
              onClick={onRecargar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors"
              disabled={loading}
              title="Recargar"
            >
              <FiRefreshCw className={`text-xl ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onDescargarPDF}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ternary-dark transition-colors flex items-center gap-2"
              title="Descargar PDF"
            >
              <FiDownload className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
