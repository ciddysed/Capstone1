import React from 'react';
import { 
  Box, Typography, Stepper, Step, StepLabel, StepContent,
  Paper, Stack, LinearProgress, Chip, alpha, Card, CardContent,
  Grid, Button, Tooltip, useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { styled } from '@mui/material/styles';

const StatusCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 40px -12px rgba(128, 0, 0, 0.2)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 45px -10px rgba(128, 0, 0, 0.3)',
  },
}));

// Maroon and Gold theme colors
const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};

const gold = {
  light: '#FFF0B9',
  main: '#FFC72C',
  dark: '#D4A500',
  contrastText: '#000000',
};

const StepLabelStyled = styled(StepLabel)(({ theme }) => ({
  '& .MuiStepLabel-iconContainer': {
    '& .MuiStepIcon-root': {
      color: maroon.main,
      '&.Mui-active': {
        color: gold.dark,
      },
      '&.Mui-completed': {
        color: '#4caf50',
      },
    },
  },
}));

const getStatusIcon = (status) => {
  switch (status) {
    case 'APPROVED':
      return <CheckCircleIcon color="success" />;
    case 'REJECTED':
      return <ErrorIcon color="error" />;
    case 'PENDING':
      return <PendingIcon color="warning" />;
    case 'UNDER_REVIEW':
      return <AccessTimeIcon color="info" />;
    default:
      return <HelpIcon color="disabled" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'PENDING':
      return 'warning';
    case 'UNDER_REVIEW':
      return 'info';
    default:
      return 'default';
  }
};

const StatusDashboard = ({ applicationData, applicationStatus, feedback = [] }) => {
  const theme = useTheme();
  const activeStep = getActiveStep(applicationStatus);
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    switch (applicationStatus) {
      case 'PENDING':
        return 25;
      case 'UNDER_REVIEW':
        return 50;
      case 'APPROVED':
        return 100;
      case 'REJECTED':
        return 100;
      default:
        return 0;
    }
  };
  
  function getActiveStep(status) {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'UNDER_REVIEW':
        return 1;
      case 'APPROVED':
        return 3;
      case 'REJECTED':
        return 2;
      default:
        return 0;
    }
  }

  const steps = [
    {
      label: 'Application Submitted',
      description: 'Your application has been received and is pending review.',
    },
    {
      label: 'Under Evaluation',
      description: 'Your application is currently being evaluated by our team.',
    },
    {
      label: 'Decision Made',
      description: 'A decision has been made on your application.',
    },
    {
      label: 'Final Steps',
      description: applicationStatus === 'APPROVED' 
        ? 'Congratulations! Your application has been approved.' 
        : 'Please check the status of your application.',
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {/* Status Overview Card */}
        <Grid item xs={12}>
          <StatusCard>
            <CardContent sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" gutterBottom color={maroon.dark}>
                    Application Status
                  </Typography>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getStatusIcon(applicationStatus)}
                    <Typography variant="body1" fontWeight={500}>
                      {applicationStatus || 'PENDING'}
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={getProgressPercentage()}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: alpha(theme.palette.grey[300], 0.8),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 
                            applicationStatus === 'APPROVED' ? '#4caf50' :
                            applicationStatus === 'REJECTED' ? '#f44336' : gold.main,
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {getProgressPercentage()}%
                  </Typography>
                </Box>
                
                <Chip 
                  label={applicationStatus || 'PENDING'} 
                  color={getStatusColor(applicationStatus)}
                  variant="outlined"
                  sx={{ fontWeight: 'bold', px: 1 }}
                />
                
                <Tooltip title="View details about the evaluation process">
                  <Button 
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{
                      borderColor: maroon.main,
                      color: maroon.main,
                      '&:hover': {
                        borderColor: maroon.dark,
                        backgroundColor: alpha(maroon.light, 0.1),
                      }
                    }}
                  >
                    View Details
                  </Button>
                </Tooltip>
              </Stack>
            </CardContent>
          </StatusCard>
        </Grid>
        
        {/* Application Progress Stepper */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: theme.shape.borderRadius * 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: maroon.main, fontWeight: 'bold' }}>
              Application Progress
            </Typography>
            <Box sx={{ maxWidth: 600, my: 2 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label} completed={index < activeStep}>
                    <StepLabelStyled>
                      <Typography variant="subtitle2" fontWeight={500}>
                        {step.label}
                      </Typography>
                    </StepLabelStyled>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Paper>
        </Grid>
        
        {/* Feedback Panel */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              borderRadius: theme.shape.borderRadius * 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: maroon.main, fontWeight: 'bold' }}>
              Feedback & Notes
            </Typography>
            
            {feedback && feedback.length > 0 ? (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {feedback.map((item, index) => (
                  <Box 
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.7),
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.title || 'Evaluator Feedback'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">
                      {item.message || 'No detailed feedback available.'}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  No feedback available yet.
                </Typography>
                <Typography variant="caption">
                  Feedback will appear here once your application has been reviewed.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatusDashboard;
