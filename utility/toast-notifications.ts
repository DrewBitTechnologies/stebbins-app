import { useCallback, useRef } from 'react';

export interface ToastState {
  message: string | null;
  timer: React.MutableRefObject<NodeJS.Timeout | null>;
}

export const useToast = () => {
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((
    message: string,
    setToastMessage: (message: string | null) => void,
    duration: number = 2000
  ) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToastMessage(message);
    
    toastTimer.current = setTimeout(() => {
      setToastMessage(null);
      toastTimer.current = null;
    }, duration);
  }, []);

  const clearToast = useCallback((setToastMessage: (message: string | null) => void) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToastMessage(null);
  }, []);

  return { showToast, clearToast };
};

export const getMarkerTypeDisplayName = (type: string): string => {
  const typeNameMap: Record<string, string> = {
    nature: 'Nature',
    mile: 'Mile',
    safety: 'Safety',
    poi: 'POI'
  };
  
  return typeNameMap[type] || type;
};