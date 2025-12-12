// components/ui/CustomSelect.jsx - Componente Select completamente personalizado (no nativo)
import { useState, useRef, useEffect, forwardRef } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

const CustomSelect = forwardRef(({ 
  label, 
  error, 
  helperText,
  options = [],
  placeholder = 'Seleccionar...',
  value,
  onChange,
  className = '',
  containerClassName = '',
  disabled = false,
  required = false,
  name,
  id,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);
  const buttonRef = useRef(null);

  // Encontrar el label de la opción seleccionada
  const selectedOption = options.find(opt => {
    const optValue = typeof opt === 'object' ? opt.value : opt;
    return optValue === value;
  });
  
  const displayValue = selectedOption 
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : placeholder;

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll al elemento seleccionado cuando se abre
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const selectedElement = listboxRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, value]);

  // Manejo de teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => {
            const next = prev < options.length - 1 ? prev + 1 : prev;
            // Scroll al elemento destacado
            if (listboxRef.current) {
              const items = listboxRef.current.querySelectorAll('[role="option"]');
              if (items[next]) {
                items[next].scrollIntoView({ block: 'nearest' });
              }
            }
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => {
            const next = prev > 0 ? prev - 1 : 0;
            if (listboxRef.current) {
              const items = listboxRef.current.querySelectorAll('[role="option"]');
              if (items[next]) {
                items[next].scrollIntoView({ block: 'nearest' });
              }
            }
            return next;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (highlightedIndex >= 0 && options[highlightedIndex]) {
            const opt = options[highlightedIndex];
            const optValue = typeof opt === 'object' ? opt.value : opt;
            handleSelect(optValue);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          buttonRef.current?.focus();
          break;
        case 'Tab':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        default:
          // Buscar por primera letra
          const char = e.key.toLowerCase();
          const foundIndex = options.findIndex(opt => {
            const label = typeof opt === 'object' ? opt.label : opt;
            return label?.toString().toLowerCase().startsWith(char);
          });
          if (foundIndex >= 0) {
            setHighlightedIndex(foundIndex);
            if (listboxRef.current) {
              const items = listboxRef.current.querySelectorAll('[role="option"]');
              if (items[foundIndex]) {
                items[foundIndex].scrollIntoView({ block: 'nearest' });
              }
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options]);

  // Reset highlighted cuando cambia el valor
  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const handleSelect = (optValue) => {
    if (onChange) {
      // Crear un evento sintético similar al evento nativo
      const syntheticEvent = {
        target: { value: optValue, name: name },
        currentTarget: { value: optValue, name: name }
      };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
    buttonRef.current?.focus();
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        // Encontrar el índice del valor seleccionado
        const currentIndex = options.findIndex(opt => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          return optValue === value;
        });
        setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
    }
  };

  // Estilos base - soporte para padding personalizado desde className
  const hasCustomPadding = className.includes('py-') || className.includes('px-') || className.includes('p-');
  const basePadding = hasCustomPadding ? '' : 'px-3 py-2.5';
  
  const baseButtonStyles = `
    w-full ${basePadding} pr-7 border rounded-lg shadow-sm
    bg-white dark:bg-secondary-dark
    text-left
    text-gray-900 dark:text-white
    border-gray-300 dark:border-gray-600
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500
    transition-all duration-200
    cursor-pointer
    flex items-center justify-between
    ${error ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
    ${!selectedOption ? 'text-gray-500 dark:text-gray-400' : ''}
    ${className}
  `;

  const dropdownStyles = `
    absolute z-50 w-full mt-1 bg-white dark:bg-secondary-dark
    border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg
    max-h-60 overflow-auto
    focus:outline-none
  `;

  return (
    <div 
      ref={containerRef}
      className={containerClassName ? containerClassName : 'mb-4 relative'}
      {...props}
    >
      {label && (
        <label 
          htmlFor={id || name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${id || name}-label` : undefined}
          className={baseButtonStyles}
          id={id || name}
        >
          <span className="flex-1 text-left whitespace-nowrap overflow-hidden">
            {displayValue}
          </span>
          <FiChevronDown 
            className={`ml-1 flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            } ${disabled ? 'opacity-50' : ''}`} 
            size={16} 
          />
        </button>

        {isOpen && (
          <>
            {/* Overlay para móviles */}
            <div 
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Listbox */}
            <div
              ref={listboxRef}
              role="listbox"
              aria-label={label || placeholder}
              className={dropdownStyles}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.25rem',
                zIndex: 50,
              }}
            >
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No hay opciones disponibles
                </div>
              ) : (
                options.map((option, index) => {
                  const optValue = typeof option === 'object' ? option.value : option;
                  const optLabel = typeof option === 'object' ? option.label : option;
                  const isSelected = optValue === value;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      key={typeof option === 'object' ? option.value : option}
                      role="option"
                      aria-selected={isSelected}
                      data-selected={isSelected}
                      onClick={() => handleSelect(optValue)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`
                        px-4 py-2.5 text-sm cursor-pointer transition-colors
                        flex items-center justify-between
                        ${isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-900 dark:text-white'
                        }
                        ${isHighlighted && !isSelected
                          ? 'bg-gray-100 dark:bg-ternary-dark'
                          : ''
                        }
                        ${isSelected && isHighlighted
                          ? 'bg-blue-100 dark:bg-blue-900/50'
                          : ''
                        }
                        hover:bg-gray-100 dark:hover:bg-ternary-dark
                        active:bg-gray-200 dark:active:bg-ternary-dark
                      `}
                    >
                      <span className="truncate flex-1">{optLabel}</span>
                      {isSelected && (
                        <FiCheck className="ml-2 flex-shrink-0 text-blue-600 dark:text-blue-400" size={16} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
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

      {/* Input oculto para formularios */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value || ''}
          ref={ref}
        />
      )}
    </div>
  );
});

CustomSelect.displayName = 'CustomSelect';

export default CustomSelect;

