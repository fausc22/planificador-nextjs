// components/planificador/VistaTabs.jsx - Tabs de vistas del planificador
const VISTAS = {
  TURNOS: 'turnos',
  HORAS: 'horas',
  DINERO: 'acumulado',
  SEMANAL: 'semanal'
};

export default function VistaTabs({ vistaActual, onCambiarVista }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onCambiarVista(VISTAS.TURNOS)}
        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
          vistaActual === VISTAS.TURNOS
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        📅 Turnos
      </button>
      <button
        onClick={() => onCambiarVista(VISTAS.HORAS)}
        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
          vistaActual === VISTAS.HORAS
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        ⏱️ Horas
      </button>
      <button
        onClick={() => onCambiarVista(VISTAS.DINERO)}
        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
          vistaActual === VISTAS.DINERO
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        💰 Dinero
      </button>
      <button
        onClick={() => onCambiarVista(VISTAS.SEMANAL)}
        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
          vistaActual === VISTAS.SEMANAL
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        📅 Semanal
      </button>
    </div>
  );
}

export { VISTAS };
