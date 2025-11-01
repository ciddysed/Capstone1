import React from 'react';
import { Box, Container, Typography, Stack, Button, Paper } from '@mui/material';
import toast from '../utils/toast';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

/**
 * Toast Demo Page
 * This component demonstrates the new toast notification system
 * Visit this page to see all notification types in action
 */
const ToastDemo = () => {
  const handleSuccessToast = () => {
    toast.success('Evaluator granted admin privileges successfully!');
  };

  const handleErrorToast = () => {
    toast.error('Failed to update application status. Please try again.');
  };

  const handleWarningToast = () => {
    toast.warning('Please select a curriculum before proceeding.');
  };

  const handleInfoToast = () => {
    toast.info('All course preferences have been forwarded for evaluation.');
  };

  const handleMultipleToasts = () => {
    toast.info('Processing your request...');
    setTimeout(() => toast.success('First step completed!'), 1000);
    setTimeout(() => toast.success('Second step completed!'), 2000);
    setTimeout(() => toast.success('All tasks completed successfully!'), 3000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#6A0000', fontWeight: 'bold' }}>
          Toast Notification System
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          All alert() prompts have been replaced with modern toast notifications.
          Click the buttons below to see each notification type in action.
        </Typography>

        <Stack spacing={3}>
          {/* Success Toast */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: '#4caf50' }} />
              Success Notification
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Used for successful operations, confirmations, and completed actions.
            </Typography>
            <Button
              variant="contained"
              onClick={handleSuccessToast}
              sx={{ 
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#45a049' }
              }}
            >
              Show Success Toast
            </Button>
          </Box>

          {/* Error Toast */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon sx={{ color: '#6A0000' }} />
              Error Notification
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Used for errors, failures, and critical issues (styled in your maroon theme color).
            </Typography>
            <Button
              variant="contained"
              onClick={handleErrorToast}
              sx={{ 
                bgcolor: '#6A0000',
                '&:hover': { bgcolor: '#450000' }
              }}
            >
              Show Error Toast
            </Button>
          </Box>

          {/* Warning Toast */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ color: '#ff9800' }} />
              Warning Notification
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Used for validation messages, cautionary information, and important notices.
            </Typography>
            <Button
              variant="contained"
              onClick={handleWarningToast}
              sx={{ 
                bgcolor: '#ff9800',
                '&:hover': { bgcolor: '#fb8c00' }
              }}
            >
              Show Warning Toast
            </Button>
          </Box>

          {/* Info Toast */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon sx={{ color: '#2196f3' }} />
              Info Notification
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Used for general information, status updates, and neutral messages.
            </Typography>
            <Button
              variant="contained"
              onClick={handleInfoToast}
              sx={{ 
                bgcolor: '#2196f3',
                '&:hover': { bgcolor: '#1976d2' }
              }}
            >
              Show Info Toast
            </Button>
          </Box>

          {/* Multiple Toasts */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Multiple Stacked Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The system can display multiple notifications at once, stacked vertically.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleMultipleToasts}
              sx={{ 
                borderColor: '#6A0000',
                color: '#6A0000',
                '&:hover': { 
                  borderColor: '#450000',
                  bgcolor: 'rgba(106, 0, 0, 0.04)'
                }
              }}
            >
              Show Multiple Toasts
            </Button>
          </Box>
        </Stack>

        {/* Features Box */}
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: '#FFF0B9',
            borderRadius: 2,
            border: '2px solid #FFC72C'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: '#6A0000' }}>
            ✨ Key Features
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              ✓ Non-blocking - doesn't interrupt user workflow
            </Typography>
            <Typography variant="body2">
              ✓ Auto-dismisses after 4-5 seconds
            </Typography>
            <Typography variant="body2">
              ✓ Smooth slide-in animations
            </Typography>
            <Typography variant="body2">
              ✓ Consistent with maroon & gold theme
            </Typography>
            <Typography variant="body2">
              ✓ Mobile-responsive design
            </Typography>
            <Typography variant="body2">
              ✓ Accessible and screen-reader friendly
            </Typography>
          </Stack>
        </Paper>
      </Paper>
    </Container>
  );
};

export default ToastDemo;
