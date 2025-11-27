
import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const WeeklyView = ({ planificador, mes, anio, onEditTurno }) => {
    const [semanaActual, setSemanaActual] = useState(0);
    const [semanas, setSemanas] = useState([]);
    const [descargando, setDescargando] = useState(false);

    useEffect(() => {
        if (planificador?.fechas) {
            organizarPorSemanas();
        }
    }, [planificador]);

    const organizarPorSemanas = () => {
        const fechas = planificador.fechas;
        const semanasTemp = [];
        let semanaActualTemp = [];

        fechas.forEach((fecha, index) => {
            // Si es lunes y no es el primer día, o si ya llenamos 7 días
            if (index > 0 && (fecha.diaSemana === 'Lunes' || semanaActualTemp.length === 7)) {
                if (semanaActualTemp.length > 0) {
                    semanasTemp.push(semanaActualTemp);
                }
                semanaActualTemp = [];
            }
            semanaActualTemp.push(fecha);
        });

        if (semanaActualTemp.length > 0) {
            semanasTemp.push(semanaActualTemp);
        }

        setSemanas(semanasTemp);
        setSemanaActual(0);
    };

    const cambiarSemana = (direccion) => {
        const nuevaSemana = semanaActual + direccion;
        if (nuevaSemana >= 0 && nuevaSemana < semanas.length) {
            setSemanaActual(nuevaSemana);
        }
    };

    const descargarPdfSemanal = async () => {
        try {
            setDescargando(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planeamiento/pdf-semanal/${mes}/${anio}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Error al descargar PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Planificador_Semanal_${mes}_${anio}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('PDF Semanal descargado');
        } catch (error) {
            console.error(error);
            toast.error('Error al descargar PDF');
        } finally {
            setDescargando(false);
        }
    };

    const getTurnoColor = (turno) => {
        if (!turno || turno === 'Libre') return 'bg-gray-50 border-gray-200 text-gray-400';
        const t = turno.toLowerCase();
        if (t.includes('vacacion')) return 'bg-green-100 border-green-300 text-green-800';
        if (t.includes('guardia')) return 'bg-indigo-100 border-indigo-300 text-indigo-800';

        // Intentar detectar mañana/tarde/noche por hora
        if (t.match(/^\d/)) {
            const hora = parseInt(t);
            if (hora >= 6 && hora < 12) return 'bg-blue-100 border-blue-300 text-blue-800';
            if (hora >= 12 && hora < 18) return 'bg-orange-100 border-orange-300 text-orange-800';
            if (hora >= 18 || hora < 6) return 'bg-purple-100 border-purple-300 text-purple-800';
        }

        return 'bg-blue-50 border-blue-200 text-blue-700';
    };

    if (semanas.length === 0) return <div className="p-8 text-center text-gray-500">Cargando semanas...</div>;

    const diasSemana = semanas[semanaActual];
    const rangoFecha = `${diasSemana[0].fecha} - ${diasSemana[diasSemana.length - 1].fecha}`;

    return (
        <div className="bg-white dark:bg-secondary-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header de Navegación Semanal */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => cambiarSemana(-1)}
                        disabled={semanaActual === 0}
                        className={`p-2 rounded-lg transition-colors ${semanaActual === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                    >
                        <FiChevronLeft size={24} />
                    </button>

                    <div className="text-center min-w-[200px]">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 justify-center">
                            <FiCalendar /> Semana {semanaActual + 1}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {rangoFecha}
                        </p>
                    </div>

                    <button
                        onClick={() => cambiarSemana(1)}
                        disabled={semanaActual === semanas.length - 1}
                        className={`p-2 rounded-lg transition-colors ${semanaActual === semanas.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                    >
                        <FiChevronRight size={24} />
                    </button>
                </div>

                <button
                    onClick={descargarPdfSemanal}
                    disabled={descargando}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                    {descargando ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <FiDownload />
                    )}
                    Descargar PDF Semanal
                </button>
            </div>

            {/* Grid Semanal */}
            <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700 overflow-x-auto">
                {diasSemana.map((dia) => (
                    <div key={dia.fecha} className={`min-w-[200px] md:min-w-0 flex flex-col ${dia.esFeriado ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                        {/* Cabecera del Día */}
                        <div className={`p-3 text-center border-b border-gray-200 dark:border-gray-700 ${dia.fecha === new Date().toLocaleDateString('es-AR')
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-gray-50 dark:bg-gray-800/50'
                            }`}>
                            <div className="font-bold text-gray-800 dark:text-white text-lg">{dia.diaSemana}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{dia.fecha}</div>
                            {dia.esFeriado && <span className="text-xs text-red-600 font-bold mt-1 block">FERIADO</span>}
                        </div>

                        {/* Lista de Empleados */}
                        <div className="flex-1 p-2 space-y-2 max-h-[600px] overflow-y-auto">
                            {Object.entries(dia.empleados).map(([empleado, turno]) => {
                                if (!turno || turno === 'Libre') return null; // Solo mostrar los que trabajan

                                return (
                                    <div
                                        key={`${dia.fecha}-${empleado}`}
                                        onClick={() => onEditTurno && onEditTurno(dia.fecha, empleado, turno)}
                                        className={`p-3 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all group ${getTurnoColor(turno)}`}
                                    >
                                        <div className="font-bold text-sm truncate" title={empleado}>
                                            {empleado}
                                        </div>
                                        <div className="text-xs font-medium mt-1 flex justify-between items-center">
                                            <span>{turno}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Mensaje si nadie trabaja */}
                            {Object.values(dia.empleados).every(t => !t || t === 'Libre') && (
                                <div className="text-center py-8 text-gray-400 text-sm italic">
                                    Sin turnos asignados
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeeklyView;
