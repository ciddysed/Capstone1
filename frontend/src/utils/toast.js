/**
 * Unified toast notification system with consistent styling
 * Replaces all alert() and inconsistent notification patterns
 * 
 * This is a singleton event emitter that components can subscribe to
 */

let listeners = [];
let toastId = 0;

const maroonTheme = {
  main: '#6A0000',
  light: '#8D323C',
  dark: '#450000',
};

const goldTheme = {
  main: '#FFC72C',
  light: '#FFF0B9',
  dark: '#D4A500',
};

const createToast = (message, severity = 'info', duration = 4000) => {
  const id = ++toastId;
  const toast = {
    id,
    message,
    severity,
    duration,
    open: true,
  };
  
  // Notify all listeners
  listeners.forEach(listener => listener(toast));
  
  return id;
};

export const toast = {
  /**
   * Success notification
   * @param {string} message - The message to display
   */
  success: (message) => {
    return createToast(message, 'success', 4000);
  },

  /**
   * Error notification
   * @param {string} message - The message to display
   */
  error: (message) => {
    return createToast(message, 'error', 5000);
  },

  /**
   * Warning notification
   * @param {string} message - The message to display
   */
  warning: (message) => {
    return createToast(message, 'warning', 4500);
  },

  /**
   * Info notification
   * @param {string} message - The message to display
   */
  info: (message) => {
    return createToast(message, 'info', 4000);
  },

  /**
   * Subscribe to toast events
   * @param {Function} listener - Function to call when a toast is created
   * @returns {Function} Unsubscribe function
   */
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
};

export default toast;
