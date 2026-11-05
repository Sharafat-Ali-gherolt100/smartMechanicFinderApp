import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ visible: true, message, type, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
};