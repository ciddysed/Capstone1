import React from "react";
import { Typography, Box, CircularProgress, Card, Stack, alpha, Grid } from "@mui/material";
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
          <Stack spacing={2.5}>
            {coursePreferences.map((preference) => (
              <Card
                key={preference.preferenceId || preference.id}
                sx={{
                  p: 0,
                  borderRadius: 1,
                  border: `1px solid ${alpha('#000', 0.08)}`,
                  boxShadow: 'none',
                  overflow: 'hidden'
                }}
              >
                <Grid container>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 2, 
                      borderLeft: `4px solid ${
                        preference.priorityOrder === "FIRST" ||
                        preference.preferenceOrder === "FIRST" ||
                        preference.priorityOrder === 1 ||
                        preference.preferenceOrder === 1 
                          ? maroon.main 
                          : gold.main
                      }`,
                      '&:hover': {
                        backgroundColor: alpha('#f5f5f5', 0.7)
                      },
                    }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatPriority(preference.priorityOrder || preference.preferenceOrder)}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 0.5 }}>
                          {getCourseName(preference.course?.courseId || preference.courseId)}
                        </Typography>
                        {preference.course?.department?.departmentName && (
                          <Typography variant="body2" color="text.secondary">
                            {preference.course.department.departmentName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            ))}
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