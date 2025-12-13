import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  Grid,
  IconButton,
  Stack,
  Paper,
  alpha
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  Info as InfoIcon
} from "@mui/icons-material";
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

const SubjectDetailModal = ({ open, onClose, subjectRecord }) => {
  if (!subjectRecord) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 24 }} />;
      case 'REJECTED':
        return <CancelIcon sx={{ color: '#f44336', fontSize: 24 }} />;
      case 'PENDING':
      default:
        return <PendingIcon sx={{ color: '#ff9800', fontSize: 24 }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return '#4caf50';
      case 'REJECTED':
        return '#f44336';
      case 'PENDING':
      default:
        return '#ff9800';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return alpha('#4caf50', 0.1);
      case 'REJECTED':
        return alpha('#f44336', 0.1);
      case 'PENDING':
      default:
        return alpha('#ff9800', 0.1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: maroon.main,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon />
          <Typography variant="h6" fontWeight={600}>
            Subject Evaluation Details
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#FFFFFF',
            '&:hover': { bgcolor: alpha('#FFFFFF', 0.2) }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Stack spacing={3}>
          {/* Subject Information */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(maroon.light, 0.05),
              border: `1px solid ${alpha(maroon.main, 0.2)}`,
              borderRadius: 2
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="overline" color="text.secondary">
                  Subject Code
                </Typography>
                <Typography variant="h5" fontWeight={700} color={maroon.main} gutterBottom>
                  {subjectRecord.subject?.subjectCode || 'N/A'}
                </Typography>
                <Typography variant="body1" fontWeight={500} gutterBottom>
                  {subjectRecord.subject?.descriptiveTitle || 'N/A'}
                </Typography>
                {subjectRecord.subject?.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {subjectRecord.subject.description}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Units
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {subjectRecord.subject?.units || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Grade
                    </Typography>
                    <Chip
                      label={subjectRecord.grade || 'N/A'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mt: 0.5
                      }}
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Semester Information */}
          {subjectRecord.subject?.semester && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Academic Period
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Year ${subjectRecord.subject.semester.yearLevel}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: gold.main, color: gold.dark }}
                />
                <Chip
                  label={`Semester ${subjectRecord.subject.semester.semesterNumber}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: gold.main, color: gold.dark }}
                />
              </Box>
            </Box>
          )}

          <Divider />

          {/* Evaluation Status */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon fontSize="small" />
              Evaluation Status
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: getStatusBgColor(subjectRecord.status),
                border: `2px solid ${getStatusColor(subjectRecord.status)}`,
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {getStatusIcon(subjectRecord.status)}
                <Typography variant="h6" fontWeight={700} sx={{ color: getStatusColor(subjectRecord.status) }}>
                  {subjectRecord.status}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {subjectRecord.status === 'APPROVED' && 
                  'This subject has been evaluated and accredited. Credit will be given for this course.'}
                {subjectRecord.status === 'PENDING' && 
                  'This subject is currently under evaluation. Please wait for the evaluator to complete the review.'}
                {subjectRecord.status === 'REJECTED' && 
                  'This subject was not accredited. You may need to take this course as part of your curriculum. Please review the evaluation details below.'}
              </Typography>
              {subjectRecord.recordDate && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Recorded on: {formatDate(subjectRecord.recordDate)}
                </Typography>
              )}
            </Paper>
          </Box>

          {/* Process of Accreditation */}
          {subjectRecord.processOfAccreditation && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon fontSize="small" />
                Process of Accreditation
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: alpha('#f5f5f5', 0.5),
                  border: `1px solid ${alpha('#000', 0.1)}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {subjectRecord.processOfAccreditation}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Substantive Basis */}
          {subjectRecord.substantiveBasis && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon fontSize="small" />
                Substantive Basis
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: alpha('#f5f5f5', 0.5),
                  border: `1px solid ${alpha('#000', 0.1)}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {subjectRecord.substantiveBasis}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Course Details */}
          {subjectRecord.subject && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Additional Course Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Lecture Hours
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {subjectRecord.subject.lecHours || 'N/A'} hours/week
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Laboratory Hours
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {subjectRecord.subject.labHours || 'N/A'} hours/week
                  </Typography>
                </Grid>
                {subjectRecord.subject.prerequisites && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Prerequisites
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {subjectRecord.subject.prerequisites}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Help Text for Rejected Status */}
          {subjectRecord.status === 'REJECTED' && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha('#ff9800', 0.1),
                border: `1px solid ${alpha('#ff9800', 0.3)}`,
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} color="#f57c00" gutterBottom>
                Need Help?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If you believe this evaluation is incorrect or would like to appeal, please contact your program evaluator 
                or visit the admissions office. You may be required to submit additional documentation.
              </Typography>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, bgcolor: alpha('#f5f5f5', 0.5) }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: maroon.main,
            '&:hover': { bgcolor: maroon.dark },
            px: 3
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SubjectDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subjectRecord: PropTypes.shape({
    id: PropTypes.number,
    subject: PropTypes.shape({
      subjectCode: PropTypes.string,
      descriptiveTitle: PropTypes.string,
      description: PropTypes.string,
      units: PropTypes.number,
      lecHours: PropTypes.number,
      labHours: PropTypes.number,
      prerequisites: PropTypes.string,
      semester: PropTypes.shape({
        yearLevel: PropTypes.number,
        semesterNumber: PropTypes.number
      })
    }),
    grade: PropTypes.string,
    status: PropTypes.oneOf(['PENDING', 'APPROVED', 'REJECTED']),
    processOfAccreditation: PropTypes.string,
    substantiveBasis: PropTypes.string,
    recordDate: PropTypes.string
  })
};

export default SubjectDetailModal;
