// pages/control-horas/index.jsx - Control de horas trabajadas
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { FiClock, FiCalendar } from 'react-icons/fi';

export default function ControlHoras() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <>
      <Head>
        <title>Control de Horas - Planificador</title>
      </Head>

      <Layout>
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Control de Horas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Registro de fichajes y horas trabajadas
            </p>
          </div>

          {/* Filtros */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Año
                </label>
                <select
                  value={anio}
                  onChange={(e) => setAnio(parseInt(e.target.value))}
                  className="input"
                >
                  {[2024, 2025, 2026].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mes
                </label>
                <select
                  value={mes}
                  onChange={(e) => setMes(parseInt(e.target.value))}
                  className="input"
                >
                  {MESES.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empleado
                </label>
                <select className="input">
                  <option value="">Seleccionar empleado...</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="card">
            <div className="text-center py-12">
              <FiClock className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Selecciona filtros para ver registros
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

