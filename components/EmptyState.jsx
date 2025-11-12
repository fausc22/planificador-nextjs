// components/EmptyState.jsx - Estado vacío reutilizable
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="text-5xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />}
      
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {description}
        </p>
      )}
      
      {action && action}
    </div>
  );
}

