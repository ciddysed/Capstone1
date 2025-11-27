import React, { useState, useEffect } from "react";
/* eslint-disable react-hooks/exhaustive-deps */
import { 
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Chip, Grid, List, ListItem, ListItemIcon, ListItemText,
  Button, Divider, alpha, CircularProgress
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  MenuBook as SubjectIcon
} from "@mui/icons-material";
import PropTypes from "prop-types";
import axios from "axios";

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

const CourseInformation = ({ course }) => {
  const [loading, setLoading] = useState(true);
  const [curriculum, setCurriculum] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState('overview');
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!course?.courseId) {
      setLoading(false);
      return;
    }
    
    const fetchCurriculum = async () => {
      try {
        const response = await axios.get(`https://eteeap-foth.onrender.com/api/curriculums/course/${course.courseId}`);
        setCurriculum(response.data);
      } catch (error) {
        console.error("Error fetching curriculum:", error);
        // Use mock data for development purposes
        setCurriculum(getMockCurriculum());
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurriculum();
  }, [course]);
  
  const getMockCurriculum = () => ({
    id: 1,
    programName: course?.courseName || "Bachelor of Science in Information Technology",
    yearStarted: 2023,
    description: "This program prepares students for careers in the IT industry, with a focus on software development, network administration, and database management.",
    department: {
      departmentId: 1,
      departmentName: course?.department?.departmentName || "College of Computer Studies"
    },
    subjects: [
      { id: 1, subjectCode: "IT101", descriptiveTitle: "Introduction to Computing", units: 3 },
      { id: 2, subjectCode: "IT102", descriptiveTitle: "Programming Fundamentals", units: 4 },
      { id: 3, subjectCode: "IT103", descriptiveTitle: "Data Structures and Algorithms", units: 4 },
      { id: 4, subjectCode: "IT104", descriptiveTitle: "Database Management Systems", units: 3 },
      { id: 5, subjectCode: "IT105", descriptiveTitle: "Web Development", units: 3 }
    ],
    faculty: [
      { id: 1, name: "Dr. John Smith", position: "Department Chair", specialization: "Software Engineering" },
      { id: 2, name: "Prof. Maria Garcia", position: "Professor", specialization: "Database Systems" },
      { id: 3, name: "Dr. Robert Johnson", position: "Associate Professor", specialization: "Network Security" }
    ]
  });
  
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress size={30} sx={{ color: maroon.main }} />
      </Box>
    );
  }
  
  if (!course) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Course information not available.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: maroon.main, fontWeight: 600 }}>
          {course.courseCode ? `${course.courseCode}: ` : ''}{course.courseName}
        </Typography>
        <Chip 
          icon={<SchoolIcon />}
          label={course.department?.departmentName || "Department"}
          variant="outlined"
          color="secondary"
          size="small"
          sx={{ borderColor: gold.main, color: gold.dark }}
        />
        {curriculum && (
          <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
            {curriculum.description}
          </Typography>
        )}
      </Box>
      
      <Accordion 
        expanded={expandedAccordion === 'overview'} 
        onChange={handleAccordionChange('overview')}
        sx={{ 
          mb: 1,
          boxShadow: 'none',
          '&:before': { display: 'none' },
          border: `1px solid ${alpha(maroon.main, 0.2)}`,
          borderRadius: '8px !important',
          overflow: 'hidden'
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ bgcolor: alpha(maroon.light, 0.05) }}
        >
          <Typography variant="subtitle1" fontWeight={600}>Program Overview</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Key Information</Typography>
              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CalendarIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Duration" 
                    secondary="4 Years"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TimeIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Total Units" 
                    secondary="145 Units"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SchoolIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Department" 
                    secondary={course.department?.departmentName}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Career Opportunities</Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" component="div">
                  <ul style={{ paddingLeft: 16, margin: '8px 0' }}>
                    <li>Software Developer</li>
                    <li>Network Administrator</li>
                    <li>Database Administrator</li>
                    <li>Systems Analyst</li>
                    <li>IT Project Manager</li>
                  </ul>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      <Accordion 
        expanded={expandedAccordion === 'subjects'} 
        onChange={handleAccordionChange('subjects')}
        sx={{ 
          mb: 1,
          boxShadow: 'none',
          '&:before': { display: 'none' },
          border: `1px solid ${alpha(maroon.main, 0.2)}`,
          borderRadius: '8px !important',
          overflow: 'hidden'
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ bgcolor: alpha(maroon.light, 0.05) }}
        >
          <Typography variant="subtitle1" fontWeight={600}>Core Subjects</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {curriculum?.subjects && curriculum.subjects.length > 0 ? (
            <List dense>
              {curriculum.subjects.slice(0, 5).map((subject) => (
                <ListItem key={subject.id} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SubjectIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {subject.subjectCode}: {subject.descriptiveTitle}
                        </Typography>
                        <Chip 
                          label={`${subject.units} unit${subject.units !== 1 ? 's' : ''}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
              No subject information available.
            </Typography>
          )}
          
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              size="small"
              sx={{ 
                borderColor: gold.main,
                color: gold.dark,
                '&:hover': { 
                  borderColor: gold.dark,
                  bgcolor: alpha(gold.light, 0.2)
                }
              }}
            >
              View Full Curriculum
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
      
      <Accordion 
        expanded={expandedAccordion === 'faculty'} 
        onChange={handleAccordionChange('faculty')}
        sx={{ 
          boxShadow: 'none',
          '&:before': { display: 'none' },
          border: `1px solid ${alpha(maroon.main, 0.2)}`,
          borderRadius: '8px !important',
          overflow: 'hidden'
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ bgcolor: alpha(maroon.light, 0.05) }}
        >
          <Typography variant="subtitle1" fontWeight={600}>Faculty</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {curriculum?.faculty && curriculum.faculty.length > 0 ? (
            <List dense>
              {curriculum.faculty.map((faculty, index) => (
                <React.Fragment key={faculty.id || index}>
                  {index > 0 && <Divider variant="inset" component="li" />}
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={faculty.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {faculty.position}
                          </Typography>
                          {faculty.specialization && (
                            <>
                              {" — "}
                              <Typography component="span" variant="body2" color="text.secondary">
                                {faculty.specialization}
                              </Typography>
                            </>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
              No faculty information available.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

CourseInformation.propTypes = {
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

export default CourseInformation;
