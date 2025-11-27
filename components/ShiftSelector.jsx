
import React from 'react';
import { FiClock, FiSun, FiMoon, FiCheck } from 'react-icons/fi';

const ShiftSelector = ({ turnos, turnoSeleccionado, onSelect, onCancel }) => {
    // Agrupar turnos por tipo/horario
    const grupos = {
        'Mañana': [],
        'Tarde': [],
        'Noche': [],
        'Especiales': []
    };

    turnos.forEach(t => {
        const nombre = t.turnos.toLowerCase();
        const horaInicio = t.horaInicio;

        if (nombre.includes('vacacion') || nombre.includes('guardia') || nombre.includes('franco') || nombre.includes('licencia')) {
            grupos['Especiales'].push(t);
        } else if (horaInicio >= 5 && horaInicio < 13) {
            grupos['Mañana'].push(t);
        } else if (horaInicio >= 13 && horaInicio < 19) {
            grupos['Tarde'].push(t);
        } else {
            grupos['Noche'].push(t);
        }
    });

    const getIconoGrupo = (grupo) => {
        switch (grupo) {
            case 'Mañana': return <FiSun className="text-orange-500" />;
            case 'Tarde': return <FiSun className="text-yellow-600" />;
            case 'Noche': return <FiMoon className="text-indigo-500" />;
            default: return <FiClock className="text-gray-500" />;
        }
    };

    const getClaseBoton = (turno) => {
        const esSeleccionado = turnoSeleccionado === turno.turnos;
        const base = "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 text-sm font-medium h-full";

        if (esSeleccionado) {
            return `${base} bg-blue-600 text-white border-blue-600 shadow-md transform scale-105`;
        }

        return `${base} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700`;
    };

    return (
        <div className="bg-white dark:bg-secondary-dark rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl mx-auto overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    <FiClock /> Seleccionar Turno
                </h3>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    ✕
                </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
                {/* Opción Libre */}
                <div className="mb-6">
                    <button
                        onClick={() => onSelect('Libre')}
                        className={`w-full p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${turnoSeleccionado === 'Libre' || !turnoSeleccionado
                                ? 'bg-gray-600 text-white border-gray-600 shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <span className="font-bold">LIBRE</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(grupos).map(([nombreGrupo, turnosGrupo]) => (
                        turnosGrupo.length > 0 && (
                            <div key={nombreGrupo} className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 font-semibold text-gray-500 dark:text-gray-400 border-b pb-2 mb-1">
                                    {getIconoGrupo(nombreGrupo)}
                                    {nombreGrupo}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {turnosGrupo.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => onSelect(t.turnos)}
                                            className={getClaseBoton(t)}
                                        >
                                            <span className="text-xs opacity-75 mb-1">{t.horaInicio}hs - {t.horaFin}hs</span>
                                            <span>{t.turnos}</span>
                                            {turnoSeleccionado === t.turnos && <FiCheck className="mt-1" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default ShiftSelector;
