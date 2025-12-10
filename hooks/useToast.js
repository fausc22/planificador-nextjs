// hooks/useToast.js - Hook para mostrar notificaciones toast
import toast from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message) => {
    toast.success(message, {
      duration: 3000,
    });
  };

  const showError = (message) => {
    toast.error(message, {
      duration: 4000,
    });
  };

  const showInfo = (message) => {
    toast(message, {
      duration: 3000,
      icon: 'ℹ️',
    });
  };

  const showLoading = (message) => {
    return toast.loading(message);
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showLoading,
    dismiss,
  };
};
