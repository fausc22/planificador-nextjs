// components/planificador/ModalPDF.jsx - Modal para generar PDF
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FiDownload, FiLoader } from 'react-icons/fi';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ModalPDF({
  isOpen,
  onClose,
  mesActual,
  anioActual,
  planificador,
  coloresEmpleados,
  empleadoParaPdf,
  generandoPdf,
  onCambiarEmpleadoPdf,
  onCambiarColor,
  onAplicarPaleta,
  onGenerarPdf
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Descargar PDF del Planificador"
      size="lg"
    >
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          📅 <strong>{MESES[mesActual - 1]} {anioActual}</strong> - Selecciona opciones para el PDF
        </p>
      </div>

      {/* Selector de tipo de PDF */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          ¿Qué desea descargar?
        </label>
        <select
          value={empleadoParaPdf}
          onChange={(e) => onCambiarEmpleadoPdf(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="todos">Todos los empleados (Grilla completa)</option>
          <optgroup label="Empleado individual">
            {planificador?.empleados?.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Selectores de color por empleado */}
      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
        {planificador?.empleados?.map((empleado) => (
          <div key={empleado} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <label className="font-medium text-gray-900 dark:text-white">
                {empleado}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={coloresEmpleados[empleado] || '#E3F2FD'}
                onChange={(e) => onCambiarColor(empleado, e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-2 border-gray-300"
              />
              <div
                className="w-24 h-10 rounded border border-gray-300"
                style={{ backgroundColor: coloresEmpleados[empleado] || '#E3F2FD' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Colores predefinidos */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Paletas predefinidas:
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAplicarPaleta('pastel')}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
          >
            Pastel
          </button>
          <button
            onClick={() => onAplicarPaleta('vibrant')}
            className="px-3 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-sm"
          >
            Vibrante
          </button>
          <button
            onClick={() => onAplicarPaleta('sin-color')}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
          >
            Sin Color
          </button>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={generandoPdf}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={onGenerarPdf}
          disabled={generandoPdf}
          className="flex-1 min-w-[140px] justify-center"
        >
          {generandoPdf ? (
            <>
              <FiLoader className="mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <FiDownload className="mr-2" />
              Generar PDF
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
