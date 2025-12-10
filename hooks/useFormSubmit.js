// hooks/useFormSubmit.js - Hook para manejo de envío de formularios
import { useState } from 'react';
import { useToast } from './useToast';

export const useFormSubmit = (submitFn, options = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useToast();
  
  const {
    successMessage = 'Operación realizada exitosamente',
    errorMessage = 'Error al procesar la solicitud',
    onSuccess,
    onError,
  } = options;

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitFn(data);
      
      if (successMessage) {
        showSuccess(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || errorMessage;
      setError(errorMsg);
      
      if (errorMessage) {
        showError(errorMsg);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    error,
    setError,
  };
};
