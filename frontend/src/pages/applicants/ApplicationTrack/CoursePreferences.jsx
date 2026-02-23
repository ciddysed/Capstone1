import React from "react";
import { Typography, Box, CircularProgress, Stack, alpha, Chip, Paper } from "@mui/material";
import { School } from "@mui/icons-material";
import PropTypes from "prop-types";

const CoursePreferences = ({
  isLoading,
  coursePreferences,
  formatPriority,
  getCourseName,
  maroon,
  gold
}) => {
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case "ACCEPTED":
      case "APPROVED":
        return { bg: alpha('#4caf50', 0.1), color: '#2e7d32', border: '#4caf50' };
      case "REJECTED":
        return { bg: alpha('#f44336', 0.1), color: '#d32f2f', border: '#f44336' };
      case "REVIEWED":
      case "UNDER_REVIEW":
        return { bg: alpha('#2196f3', 0.1), color: '#1565c0', border: '#2196f3' };
      case "PENDING":
      default:
        return { bg: alpha('#ff9800', 0.1), color: '#e65100', border: '#ff9800' };
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={30} sx={{ color: maroon.main }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${alpha('#000', 0.06)}` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: alpha(maroon.main, 0.1), 
            borderRadius: '50%', 
            p: 0.8,
            display: 'inline-flex' 
          }}>
            <School sx={{ color: maroon.main, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600" color={maroon.main}>
              Course Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your selected course preferences in order of priority
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {!coursePreferences || coursePreferences.length === 0 ? (
          <Box
            sx={{
              backgroundColor: alpha('#f8f8f8', 0.5),
              padding: 3,
              borderRadius: 1,
              textAlign: "center",
              border: `1px dashed ${alpha(gold.main, 0.5)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No course preferences found
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {coursePreferences.map((preference) => {
              const status = preference.evaluationStatus || "PENDING";
              const statusColor = getStatusColor(status);
              const isFirst =
                preference.priorityOrder === "FIRST" ||
                preference.preferenceOrder === "FIRST" ||
                preference.priorityOrder === 1 ||
                preference.preferenceOrder === 1;
              const accentColor = isFirst ? maroon.main : gold.main;

              return (
                <Paper
                  key={preference.preferenceId || preference.id}
                  variant="outlined"
                  sx={{
                    borderLeft: `4px solid ${accentColor}`,
                    border: `1px solid ${alpha('#000', 0.08)}`,
                    borderLeftWidth: 4,
                    borderLeftColor: accentColor,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    "&:hover": {
                      bgcolor: alpha('#f5f5f5', 0.7),
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top row: priority chip */}
                  <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                    <Chip
                      label={formatPriority(preference.priorityOrder || preference.preferenceOrder)}
                      size="small"
                      sx={{
                        backgroundColor: accentColor,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 22,
                        borderRadius: 1,
                      }}
                    />
                  </Box>

                  {/* Middle: course name + department */}
                  <Box sx={{ px: 2, pb: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4 }}>
                      {getCourseName(preference.course?.courseId || preference.courseId)}
                    </Typography>
                    {preference.course?.department?.departmentName && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        {preference.course.department.departmentName}
                      </Typography>
                    )}
                  </Box>

                  {/* Bottom row: evaluation status */}
                  <Box
                    sx={{
                      px: 2,
                      py: 0.75,
                      bgcolor: statusColor.bg,
                      borderTop: `1px solid ${alpha(statusColor.border, 0.25)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Evaluation Status
                    </Typography>
                    <Chip
                      label={status}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        backgroundColor: 'transparent',
                        color: statusColor.color,
                        border: `1px solid ${statusColor.border}`,
                        height: 22,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

CoursePreferences.propTypes = {
  isLoading: PropTypes.bool,
  coursePreferences: PropTypes.array,
  formatPriority: PropTypes.func.isRequired,
  getCourseName: PropTypes.func.isRequired,
  maroon: PropTypes.object.isRequired,
  gold: PropTypes.object.isRequired
};

CoursePreferences.defaultProps = {
  isLoading: false,
  coursePreferences: []
};

export default CoursePreferences;