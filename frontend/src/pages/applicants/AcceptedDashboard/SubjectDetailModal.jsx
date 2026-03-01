import React from "react";
import {
  Dialog,
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
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a0000 0%, #3d0000 40%, #6A0000 100%)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '50%',
            bgcolor: alpha('#fff', 0.15),
            border: `2px solid ${alpha('#fff', 0.3)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SchoolIcon sx={{ color: gold.main, fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
              Subject Evaluation Details
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
              Review your accreditation record
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{ color: alpha('#fff', 0.7), '&:hover': { bgcolor: alpha('#fff', 0.1), color: '#fff' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ pt: 3, pb: 2, background: 'rgba(255,255,255,0.97)' }}>
        <Stack spacing={2.5}>
          {/* Subject Information */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              background: 'rgba(255,255,255,0.93)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${alpha(maroon.main, 0.1)}`,
              borderTop: `3px solid ${maroon.main}`,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="overline" sx={{ color: alpha(maroon.main, 0.6), fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1 }}>
                  Subject Code
                </Typography>
                <Typography variant="h5" fontWeight={800} color={maroon.main} gutterBottom>
                  {subjectRecord.subject?.subjectCode || 'N/A'}
                </Typography>
                <Typography variant="body1" fontWeight={600} color={maroon.dark} gutterBottom>
                  {subjectRecord.subject?.descriptiveTitle || 'N/A'}
                </Typography>
                {subjectRecord.subject?.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {subjectRecord.subject.description}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={1.5}>
                  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(maroon.main, 0.04), border: `1px solid ${alpha(maroon.main, 0.08)}` }}>
                    <Typography variant="caption" sx={{ color: alpha(maroon.main, 0.6), fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Units</Typography>
                    <Typography variant="h6" fontWeight={800} color={maroon.main}>{subjectRecord.subject?.units || 'N/A'}</Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(maroon.main, 0.04), border: `1px solid ${alpha(maroon.main, 0.08)}` }}>
                    <Typography variant="caption" sx={{ color: alpha(maroon.main, 0.6), fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Grade</Typography>
                    <Typography variant="h6" fontWeight={800} color={maroon.main}>{subjectRecord.grade || 'N/A'}</Typography>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Semester Information */}
          {subjectRecord.subject?.semester && (
            <Box>
              <Typography variant="overline" sx={{ color: alpha(maroon.main, 0.6), fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1 }}>
                Academic Period
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                <Chip
                  label={`Year ${subjectRecord.subject.semester.yearLevel}`}
                  size="small"
                  sx={{ bgcolor: alpha(maroon.main, 0.08), color: maroon.main, fontWeight: 700, border: `1px solid ${alpha(maroon.main, 0.15)}` }}
                />
                <Chip
                  label={`Semester ${subjectRecord.subject.semester.semesterNumber}`}
                  size="small"
                  sx={{ bgcolor: alpha(maroon.main, 0.08), color: maroon.main, fontWeight: 700, border: `1px solid ${alpha(maroon.main, 0.15)}` }}
                />
              </Box>
            </Box>
          )}

          <Divider sx={{ opacity: 0.5 }} />

          {/* Evaluation Status */}
          <Box>
            <Typography variant="overline" sx={{ color: alpha(maroon.main, 0.6), fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1 }}>
              Evaluation Status
            </Typography>
            <Paper
              elevation={0}
              sx={{
                mt: 1, p: 2,
                bgcolor: getStatusBgColor(subjectRecord.status),
                border: `2px solid ${getStatusColor(subjectRecord.status)}`,
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {getStatusIcon(subjectRecord.status)}
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: getStatusColor(subjectRecord.status) }}>
                  {subjectRecord.status}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {subjectRecord.status === 'APPROVED' && 'This subject has been evaluated and accredited. Credit will be given for this course.'}
                {subjectRecord.status === 'PENDING' && 'This subject is currently under evaluation. Please wait for the evaluator to complete the review.'}
                {subjectRecord.status === 'REJECTED' && 'This subject was not accredited. You may need to take this course as part of your curriculum.'}
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
              <Typography variant="overline" sx={{ color: alpha(maroon.main, 0.6), fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1 }}>
                Process of Accreditation
              </Typography>
              <Paper elevation={0} sx={{ mt: 1, p: 2, bgcolor: alpha(maroon.main, 0.03), border: `1px solid ${alpha(maroon.main, 0.1)}`, borderRadius: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.primary' }}>
                  {subjectRecord.processOfAccreditation}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Substantive Basis */}
          {subjectRecord.substantiveBasis && (
            <Box>
              <Typography variant="overline" sx={{ color: alpha(maroon.main, 0.6), fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1 }}>
                Substantive Basis
              </Typography>
              <Paper elevation={0} sx={{ mt: 1, p: 2, bgcolor: alpha(maroon.main, 0.03), border: `1px solid ${alpha(maroon.main, 0.1)}`, borderRadius: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.primary' }}>
                  {subjectRecord.substantiveBasis}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Course Details */}
          {subjectRecord.subject && (
            <Box>
              <Typography variant="overline" sx={{ color: alpha(maroon.main, 0.6), fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1 }}>
                Additional Course Information
              </Typography>
              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(maroon.main, 0.03), border: `1px solid ${alpha(maroon.main, 0.08)}` }}>
                    <Typography variant="caption" color="text.secondary">Lecture Hours</Typography>
                    <Typography variant="body2" fontWeight={600}>{subjectRecord.subject.lecHours || 'N/A'} hrs/week</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(maroon.main, 0.03), border: `1px solid ${alpha(maroon.main, 0.08)}` }}>
                    <Typography variant="caption" color="text.secondary">Laboratory Hours</Typography>
                    <Typography variant="body2" fontWeight={600}>{subjectRecord.subject.labHours || 'N/A'} hrs/week</Typography>
                  </Paper>
                </Grid>
                {subjectRecord.subject.prerequisites && (
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(maroon.main, 0.03), border: `1px solid ${alpha(maroon.main, 0.08)}` }}>
                      <Typography variant="caption" color="text.secondary">Prerequisites</Typography>
                      <Typography variant="body2" fontWeight={600}>{subjectRecord.subject.prerequisites}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, bgcolor: alpha(maroon.main, 0.03), borderTop: `1px solid ${alpha(maroon.main, 0.1)}` }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: maroon.main,
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            '&:hover': { bgcolor: maroon.dark, transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${alpha(maroon.main, 0.35)}` },
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
