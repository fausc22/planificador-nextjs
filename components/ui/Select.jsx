// components/ui/Select.jsx - Componente Select reutilizable con estilos personalizados
import { forwardRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const Select = forwardRef(({ 
  label, 
  error, 
  helperText,
  options = [],
  placeholder = 'Seleccionar...',
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={containerClassName ? containerClassName : 'mb-4'}>
      {label && (
        <label 
          htmlFor={props.id || props.name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
      <select
        ref={ref}
        className={`
            w-full px-4 py-2.5 pr-10 border rounded-lg shadow-sm
            bg-white dark:bg-secondary-dark
          text-gray-900 dark:text-white
          border-gray-300 dark:border-gray-600
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
            transition-all duration-200
            appearance-none cursor-pointer
            ${error ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
          style={{
            backgroundImage: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
          }}
        {...props}
      >
        {placeholder && (
            <option value="" disabled className="bg-white dark:bg-secondary-dark text-gray-500 dark:text-gray-400">
            {placeholder}
          </option>
        )}
        {options.length > 0 ? (
          options.map((option) => (
            <option
              key={typeof option === 'object' ? option.value : option}
              value={typeof option === 'object' ? option.value : option}
                className="bg-white dark:bg-secondary-dark text-gray-900 dark:text-white"
            >
              {typeof option === 'object' ? option.label : option}
            </option>
          ))
        ) : (
          props.children
        )}
      </select>
        {/* Icono de flecha personalizado */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <FiChevronDown className={`text-gray-400 dark:text-gray-500 ${props.disabled ? 'opacity-50' : ''}`} size={20} />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
