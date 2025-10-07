import React from "react";
import { 
  Box, Typography, Stepper, Step, StepLabel, StepContent,
  Button, Paper, Chip, Stack, alpha
} from "@mui/material";
import {
  DescriptionOutlined as DocumentIcon,
  PaymentOutlined as PaymentIcon,
  EventAvailableOutlined as OrientationIcon,
  BookOutlined as CourseIcon,
  DoneOutlineOutlined as CompleteIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// Custom maroon and gold color palette
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

const ENROLLMENT_STEPS = [
  {
    label: 'Submit Required Documents',
    description: 'Upload all required enrollment documents',
    key: 'DOCUMENTS_SUBMISSION',
    icon: <DocumentIcon />,
    path: '/ApplicationTrack'
  },
  {
    label: 'Payment of Fees',
    description: 'Complete payment of enrollment and miscellaneous fees',
    key: 'PAYMENT',
    icon: <PaymentIcon />,
    path: '/EnrollmentPayment'
  },
  {
    label: 'Attend Orientation',
    description: 'Attend the mandatory orientation session',
    key: 'ORIENTATION',
    icon: <OrientationIcon />,
    path: '/Orientation'
  },
  {
    label: 'Course Registration',
    description: 'Register for your courses for the upcoming semester',
    key: 'COURSE_REGISTRATION',
    icon: <CourseIcon />,
    path: '/CourseRegistration'
  },
  {
    label: 'Enrollment Complete',
    description: 'You are now officially enrolled!',
    key: 'COMPLETED',
    icon: <CompleteIcon />,
    path: null
  }
];

const EnrollmentTracker = ({ currentStep, course }) => {
  const navigate = useNavigate();
  
  // Find the current step index
  const currentStepIndex = ENROLLMENT_STEPS.findIndex(step => 
    step.key === currentStep
  );
  
  // If step is not found, default to first step
  const activeStep = currentStepIndex !== -1 ? currentStepIndex : 0;
  
  return (
    <Box sx={{ maxWidth: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={600} color={maroon.main}>
          Enrollment Steps for {course?.courseName || "Your Program"}
        </Typography>
        <Chip 
          label={`Step ${activeStep + 1} of ${ENROLLMENT_STEPS.length}`} 
          color="primary"
          size="small"
          sx={{ 
            backgroundColor: maroon.main,
            fontWeight: 600
          }}
        />
      </Box>
      
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ 
        '& .MuiStepIcon-root.Mui-active': { color: maroon.main },
        '& .MuiStepIcon-root.Mui-completed': { color: '#4caf50' }
      }}>
        {ENROLLMENT_STEPS.map((step, index) => (
          <Step key={step.key}>
            <StepLabel
              optional={
                index === ENROLLMENT_STEPS.length - 1 ? (
                  <Typography variant="caption" color="text.secondary">Last step</Typography>
                ) : null
              }
              StepIconProps={{
                icon: step.icon
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2, p: 1, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 1 }}>
                <Typography variant="body2">{step.description}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                {step.path && (
                  <Button
                    variant="contained"
                    onClick={() => navigate(step.path)}
                    sx={{
                      mt: 1,
                      mr: 1,
                      bgcolor: maroon.main,
                      '&:hover': { bgcolor: maroon.dark }
                    }}
                    size="small"
                  >
                    {index === activeStep ? 'Complete This Step' : 'View Details'}
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === ENROLLMENT_STEPS.length - 1 && (
        <Paper square elevation={0} sx={{ p: 3, mt: 2, bgcolor: alpha(gold.light, 0.3), borderRadius: 2 }}>
          <Stack spacing={1} alignItems="center">
            <CompleteIcon sx={{ fontSize: 40, color: '#4caf50' }} />
            <Typography variant="h6" align="center" sx={{ fontWeight: 600, color: maroon.main }}>
              Congratulations!
            </Typography>
            <Typography variant="body1" align="center">
              You have completed all enrollment steps and are officially enrolled in {course?.courseName || "your program"}.
            </Typography>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

EnrollmentTracker.propTypes = {
  currentStep: PropTypes.string.isRequired,
  course: PropTypes.shape({
    courseId: PropTypes.number,
    courseName: PropTypes.string,
    courseCode: PropTypes.string,
    department: PropTypes.shape({
      departmentId: PropTypes.number,
      departmentName: PropTypes.string
    })
  })
};

export default EnrollmentTracker;
