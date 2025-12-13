import { useLocation } from 'react-router-dom';

/**
 * Hook to get navigation state that persists through page refresh
 * Uses sessionStorage as fallback when location.state is lost on refresh
 */
export const usePersistedLocationState = (pageKey) => {
  const location = useLocation();
  
  const getStateValue = (key) => {
    const storageKey = `${pageKey}_${key}`;
    const locationValue = location.state?.[key];
    
    if (locationValue !== undefined && locationValue !== null) {
      // Store fresh value from navigation
      sessionStorage.setItem(storageKey, JSON.stringify(locationValue));
      return locationValue;
    }
    
    // Try to retrieve from sessionStorage
    const storedValue = sessionStorage.getItem(storageKey);
    if (storedValue) {
      try {
        return JSON.parse(storedValue);
      } catch {
        return storedValue;
      }
    }
    
    return null;
  };
  
  const clearState = () => {
    // Clear all stored values for this page
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(`${pageKey}_`)) {
        sessionStorage.removeItem(key);
      }
    });
  };
  
  return { getStateValue, clearState };
};

export default usePersistedLocationState;
