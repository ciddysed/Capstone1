import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  styled,
  TextField,
  InputAdornment,
  Chip
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";

// Styled components
const DepartmentTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  color: "#800000",
  margin: theme.spacing(1, 0),
}));

const CourseListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 4,
  marginBottom: theme.spacing(0.5),
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
  "&.Mui-selected": {
    backgroundColor: "#f0e6e6",
    "&:hover": {
      backgroundColor: "#e6d9d9",
    },
  },
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  }
}));

const CourseSelectionDialog = ({
  open,
  onClose,
  onConfirm,
  availableCourses,
  priorityIndex,
  selectedCourse,
  setSelectedCourse,
}) => {
  const [groupedCourses, setGroupedCourses] = useState({});
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    // Group courses by department
    const grouped = availableCourses.reduce((acc, course) => {
      const department = course.department || "Other";
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(course);
      return acc;
    }, {});
    
    setGroupedCourses(grouped);
    
    // Set the first department as expanded by default if none is expanded
    if (Object.keys(grouped).length > 0 && expandedDepartment === null) {
      setExpandedDepartment(Object.keys(grouped)[0]);
    }
  }, [availableCourses, expandedDepartment]);

  useEffect(() => {
    // Filter courses based on search term
    if (searchTerm.trim() === "") {
      setIsSearchActive(false);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = availableCourses.filter(course => 
      course.courseName.toLowerCase().includes(term) || 
      course.courseCode.toLowerCase().includes(term) ||
      (course.majors && 
       course.majors.some(major => major.toLowerCase().includes(term)))
    );
    
    setFilteredCourses(filtered);
    setIsSearchActive(true);
  }, [searchTerm, availableCourses]);

  const handleAccordionChange = (department) => (event, isExpanded) => {
    setExpandedDepartment(isExpanded ? department : null);
  };

  const handleCourseSelection = (course) => {
    setSelectedCourse(course);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearchActive(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: "80vh" }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Select Course for {priorityIndex !== null ? `Priority ${priorityIndex + 1}` : ""}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a course from one of the departments below
        </Typography>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 2 }}>
        <SearchTextField
          fullWidth
          variant="outlined"
          placeholder="Search courses by name, code or major..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <Chip 
                  label="Clear" 
                  size="small"
                  onClick={clearSearch}
                  sx={{ cursor: "pointer" }}
                />
              </InputAdornment>
            )
          }}
        />
        
        {isSearchActive ? (
          // Show search results
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {filteredCourses.length} course(s) found
            </Typography>
            <List disablePadding>
              {filteredCourses.map((course) => (
                <CourseListItem
                  button
                  key={course.courseId}
                  onClick={() => handleCourseSelection(course)}
                  selected={selectedCourse && selectedCourse.courseId === course.courseId}
                  sx={{ 
                    borderLeft: '3px solid',
                    borderLeftColor: `${course.department.includes("Management") ? "#ffb300" : 
                                      course.department.includes("Computer") ? "#0288d1" : 
                                      course.department.includes("Arts") ? "#4caf50" : 
                                      course.department.includes("Engineering") ? "#e91e63" : "#9e9e9e"}`,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" fontWeight={selectedCourse && selectedCourse.courseId === course.courseId ? 'bold' : 'normal'}>
                          {course.courseName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.courseCode}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {course.department}
                        </Typography>
                        {course.majors && course.majors.length > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Majors: {course.majors.join(', ')}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </CourseListItem>
              ))}
            </List>
          </Box>
        ) : (
          // Show departments and courses
          Object.keys(groupedCourses).length > 0 ? (
            Object.entries(groupedCourses).map(([department, courses]) => (
              <Accordion
                key={department}
                expanded={expandedDepartment === department}
                onChange={handleAccordionChange(department)}
                disableGutters
                elevation={0}
                sx={{
                  border: "1px solid #e0e0e0",
                  mb: 1,
                  borderRadius: 1,
                  "&:before": {
                    display: "none",
                  },
                  borderLeft: '4px solid',
                  borderLeftColor: `${department.includes("Management") ? "#ffb300" : 
                                    department.includes("Computer") ? "#0288d1" : 
                                    department.includes("Arts") ? "#4caf50" : 
                                    department.includes("Engineering") ? "#e91e63" : "#9e9e9e"}`,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "#f8f8f8",
                    borderRadius: 1,
                  }}
                >
                  <DepartmentTitle variant="subtitle1">
                    {department}
                  </DepartmentTitle>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1 }}>
                  <List disablePadding>
                    {courses.map((course) => (
                      <CourseListItem
                        button
                        key={course.courseId}
                        onClick={() => handleCourseSelection(course)}
                        selected={selectedCourse && selectedCourse.courseId === course.courseId}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body1" fontWeight={selectedCourse && selectedCourse.courseId === course.courseId ? 'bold' : 'normal'}>
                                {course.courseName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {course.courseCode}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            course.majors && course.majors.length > 0 && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Majors: {course.majors.join(', ')}
                              </Typography>
                            )
                          }
                        />
                      </CourseListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No courses available
              </Typography>
            </Box>
          )
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 20 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!selectedCourse}
          variant="contained"
          sx={{
            bgcolor: "#800000",
            color: "white",
            borderRadius: 20,
            "&:hover": {
              bgcolor: "#600000",
            },
            "&.Mui-disabled": {
              bgcolor: "#cccccc",
            },
          }}
        >
          Confirm Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseSelectionDialog;