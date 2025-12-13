import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import toast from '../utils/toast';

const maroon = {
  main: '#6A0000',
  light: '#8D323C',
  dark: '#450000',
};

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

/**
 * ToastProvider - Global toast notification component
 * Add this to your App.js to enable toast notifications throughout the app
 */
export const ToastProvider = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prevToasts) => [...prevToasts, newToast]);
    });

    return unsubscribe;
  }, []);

  const handleClose = (id) => {
    setToasts((prevToasts) =>
      prevToasts.map((t) => (t.id === id ? { ...t, open: false } : t))
    );
    
    // Remove from array after animation
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 300);
  };

  return (
    <>
      {toasts.map((t, index) => (
        <Snackbar
          key={t.id}
          open={t.open}
          autoHideDuration={t.duration}
          onClose={() => handleClose(t.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          TransitionComponent={SlideTransition}
          sx={{
            top: { xs: 70, sm: 80 },
            transform: `translateY(${index * 70}px)`,
            transition: 'all 0.3s ease',
          }}
        >
          <Alert
            onClose={() => handleClose(t.id)}
            severity={t.severity}
            variant="filled"
            sx={{
              width: '100%',
              minWidth: '300px',
              maxWidth: '500px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontWeight: 500,
              fontSize: '14px',
              // Custom colors for maroon theme
              ...(t.severity === 'error' && {
                backgroundColor: maroon.main,
                color: '#FFFFFF',
                '& .MuiAlert-icon': {
                  color: '#FFFFFF',
                },
              }),
              ...(t.severity === 'success' && {
                backgroundColor: '#4caf50',
                color: '#FFFFFF',
              }),
              ...(t.severity === 'warning' && {
                backgroundColor: '#ff9800',
                color: '#FFFFFF',
              }),
              ...(t.severity === 'info' && {
                backgroundColor: '#2196f3',
                color: '#FFFFFF',
              }),
            }}
          >
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default ToastProvider;
