import React from 'react';
import { Box, Typography, Stack, alpha, Tooltip, Badge } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { maroon, gold, PreferenceBox, CourseButton } from '../styles';

const CoursePreferences = ({ priorityOrders, coursePreferences, availableCourses, openCourseDialog, getPriorityLabel, checkCourseAlreadySelected }) => {
  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {priorityOrders.map((priority, index) => {
        const preference = coursePreferences.find(pref => pref.priorityOrder === priority);
        const course = preference ? availableCourses.find(c => c.courseId === preference.course.courseId) : null;
        
        return (
          <PreferenceBox key={index} selected={!!course}>
            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%', 
                  bgcolor: course ? maroon.main : alpha(maroon.main, 0.3),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}>
                  {index + 1}
                </Box>
                <Typography variant="subtitle2" sx={{ color: course ? maroon.main : 'text.secondary' }}>
                  {getPriorityLabel(index)}
                </Typography>
              </Stack>
              
              {course ? (
                <>
                  <Typography variant="body1" fontWeight="medium" sx={{ 
                    color: maroon.main,
                    transition: 'color 0.2s',
                  }}>
                    {course.courseName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    <strong>{course.courseCode}</strong> · {course.department}
                  </Typography>
                  {course.majors && course.majors.length > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 500 }}>Available Majors:</span> {course.majors.join(', ')}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  No course selected
                </Typography>
              )}
            </Box>
            <Tooltip title={course ? "Change course selection" : "Choose a course"}>
              <CourseButton 
                size="small"
                onClick={() => openCourseDialog(index, checkCourseAlreadySelected)}
                variant={course ? "outlined" : "contained"}
                sx={{ 
                  minWidth: 100,
                  ...(course && {
                    color: maroon.main,
                    borderColor: maroon.main,
                    backgroundColor: "transparent"
                  })
                }}
              >
                {course ? "Change" : "Choose"}
              </CourseButton>
            </Tooltip>
          </PreferenceBox>
        );
      })}
    </Stack>
  );
};

export default CoursePreferences;
