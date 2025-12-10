// components/planificador/PlanificadorTabla.jsx - Tabla del planificador
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

export default function PlanificadorTabla({
  planificador,
  totales,
  vistaActual,
  turnosDisponibles,
  editando,
  turnoSeleccionado,
  vistaMobile,
  empleadosFiltrados,
  onIniciarEdicion,
  onGuardarTurno,
  onCancelarEdicion,
  onCambiarTurnoSeleccionado,
  getValorCelda,
  getTotalEmpleado,
  getTurnoClass
}) {
  if (!planificador?.fechas) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No hay datos disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-100 dark:bg-secondary-dark z-10">
          <tr>
            <th className="sticky left-0 bg-gray-100 dark:bg-secondary-dark px-4 py-3 text-left font-semibold z-20 border-r border-gray-300 dark:border-gray-600">
              Fecha
            </th>
            {empleadosFiltrados.map((empleado) => (
              <th key={empleado} className="px-3 py-3 text-center font-semibold min-w-[100px]">
                {vistaMobile ? '' : empleado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {planificador.fechas.map((fecha) => (
            <tr
              key={fecha.fecha}
              className={`border-b border-gray-200 dark:border-gray-700 ${
                fecha.esFeriado ? 'bg-red-50 dark:bg-red-900/10' : ''
              }`}
            >
              <td className="sticky left-0 bg-white dark:bg-secondary-dark px-4 py-3 font-medium border-r border-gray-300 dark:border-gray-600">
                <div>
                  <div className="text-gray-900 dark:text-white font-bold">
                    {fecha.fecha}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {fecha.diaSemana}
                  </div>
                </div>
              </td>

              {empleadosFiltrados.map((empleado) => {
                const valor = getValorCelda(fecha.fecha, empleado);
                const estaEditando = editando?.fecha === fecha.fecha && editando?.empleado === empleado;

                return (
                  <td key={`${fecha.fecha}-${empleado}`} className="px-2 py-2">
                    {estaEditando ? (
                      <div className={vistaMobile ? "flex flex-col gap-2" : "flex items-center gap-1"}>
                        <select
                          value={turnoSeleccionado}
                          onChange={(e) => onCambiarTurnoSeleccionado(e.target.value)}
                          className={`flex-1 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                            vistaMobile ? 'px-3 py-2 text-base' : 'px-2 py-1 text-xs'
                          }`}
                          autoFocus
                        >
                          {turnosDisponibles.map((t) => (
                            <option key={t.id} value={t.turnos}>
                              {t.turnos} {vistaMobile && `(${t.horas}h)`}
                            </option>
                          ))}
                        </select>
                        {vistaMobile ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => onGuardarTurno()}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                            >
                              <FiSave className="inline mr-1" />
                              Guardar
                            </button>
                            <button
                              onClick={onCancelarEdicion}
                              className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
                            >
                              <FiX className="inline mr-1" />
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => onGuardarTurno()}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                              <FiSave size={14} />
                            </button>
                            <button
                              onClick={onCancelarEdicion}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <FiX size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => vistaActual === 'turnos' && onIniciarEdicion(fecha.fecha, empleado, valor)}
                        className={`turno-cell ${
                          vistaActual === 'turnos'
                            ? getTurnoClass(valor)
                            : (valor > 0
                              ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-400')
                        } ${
                          vistaActual === 'turnos' ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
                        } ${
                          vistaMobile ? 'min-h-[60px] text-base' : 'min-h-[40px] text-sm'
                        } group relative`}
                      >
                        <span className="font-medium">
                          {vistaActual === 'turnos' && valor}
                          {vistaActual === 'horas' && (valor > 0 ? `${valor}h` : '-')}
                          {vistaActual === 'acumulado' && (valor > 0 ? `$${valor.toLocaleString('es-AR')}` : '-')}
                        </span>
                        {vistaActual === 'turnos' && !vistaMobile && (
                          <FiEdit2
                            size={12}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500"
                          />
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Fila de totales */}
          {vistaActual !== 'turnos' && !vistaMobile && (
            <tr className="bg-blue-50 dark:bg-blue-900/20 font-bold border-t-2 border-blue-500">
              <td className="sticky left-0 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-r border-gray-300 dark:border-gray-600">
                <div className="text-gray-900 dark:text-white font-bold">
                  TOTAL MES
                </div>
              </td>
              {empleadosFiltrados.map((empleado) => {
                const total = getTotalEmpleado(empleado);
                return (
                  <td key={`total-${empleado}`} className="px-3 py-3 text-center">
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-base">
                      {vistaActual === 'horas' && `${total}h`}
                      {vistaActual === 'acumulado' && `$${Number(total).toLocaleString('es-AR')}`}
                    </div>
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
