import React from "react";
import { Typography, Box, Stack, CircularProgress, Tooltip } from "@mui/material";
import { CourseBox, PreferenceStatusChip } from "./styled";
import { getStatusIcon } from "./utils";

const CoursePreferences = ({
  isLoading,
  coursePreferences,
  formatPriority,
  getCourseName
}) => (
  <Box>
    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
      Course Preferences
    </Typography>
    {isLoading ? (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    ) : coursePreferences.length > 0 ? (
      <Stack spacing={1.5}>
        {coursePreferences.map((pref, index) => (
          <CourseBox key={index} sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {formatPriority(pref.priorityOrder)}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {getCourseName(pref.course.courseId)}
              </Typography>
            </Box>
            <Tooltip title={`Status: ${pref.status}`} arrow>
              <PreferenceStatusChip
                label={pref.status}
                status={pref.status}
                icon={getStatusIcon(pref.status)}
                size="small"
              />
            </Tooltip>
          </CourseBox>
        ))}
      </Stack>
    ) : (
      <Typography variant="body2" color="text.secondary">
        No course preferences found
      </Typography>
    )}
  </Box>
);

export default CoursePreferences;