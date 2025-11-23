import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, severity = 'success', duration = 3000) => {
    setToast({ message, severity, open: true });
    
    if (duration) {
      setTimeout(() => {
        setToast(null);
      }, duration);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
};
