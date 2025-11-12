// components/Loading.jsx - Componente de carga
export default function Loading({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="spinner mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );
}

