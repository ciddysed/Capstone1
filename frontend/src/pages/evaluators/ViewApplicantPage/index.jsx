import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import ListLayout from "../../../templates/ListLayout";

const ViewApplicantPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Fix: get applicantId from location.state or from query param if needed
  const applicantId = location.state?.applicantId;

  const [applicant, setApplicant] = useState(null);
  const [coursePreferences, setCoursePreferences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!applicantId) return;
    // Fetch applicant profile
    fetch(`http://localhost:8080/api/applicants/${applicantId}`)
      .then((res) => res.json())
      .then(setApplicant)
      .catch(() => setApplicant(null));

    // Fetch course preferences
    fetch(`http://localhost:8080/api/preferences/applicant/${applicantId}`)
      .then((res) => res.json())
      .then(setCoursePreferences)
      .catch(() => setCoursePreferences([]));

    // Fetch documents with error handling for 500
    fetch(`http://localhost:8080/api/documents/applicant/${applicantId}`)
      .then(async (res) => {
        if (!res.ok) {
          return [];
        }
        try {
          return await res.json();
        } catch {
          return [];
        }
      })
      .then(setDocuments)
      .catch(() => setDocuments([]));

    // Fetch all courses for mapping courseId to courseName
    fetch("http://localhost:8080/api/courses")
      .then((res) => res.json())
      .then(setCourses)
      .catch(() => setCourses([]));
  }, [applicantId]);

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.courseId === courseId);
    return course ? course.courseName : "-";
  };

  const formatPriority = (priority) => {
    const formats = {
      FIRST: "Course 1",
      SECOND: "Course 2",
      THIRD: "Course 3",
    };
    return formats[priority] || priority;
  };

  return (
    <ListLayout>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={() => navigate("/evaluator/applicants")}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography fontWeight={600}>View Details</Typography>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 3 }}>
        {/* Left: Applicant Profile */}
        <Paper elevation={4} sx={{ flex: 1, p: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
          >
            Applicant Profile
          </Typography>
          <Stack spacing={1}>
            <DetailRow
              label="Name"
              value={
                applicant
                  ? [
                      applicant.firstName,
                      applicant.middleInitial
                        ? applicant.middleInitial + "."
                        : "",
                      applicant.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  : "-"
              }
            />
            <DetailRow label="Email" value={applicant?.email || "-"} />
            <DetailRow label="Address" value={applicant?.address || "-"} />
            <DetailRow
              label="Date of Birth"
              value={
                applicant?.dateOfBirth
                  ? new Date(applicant.dateOfBirth).toLocaleDateString()
                  : "-"
              }
            />
            <DetailRow label="Gender" value={applicant?.gender || "-"} />
          </Stack>
        </Paper>

        {/* Right: Course Preferences & Documents */}
        <Paper elevation={4} sx={{ flex: 1, p: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
          >
            Course Preferences
          </Typography>
          <List dense sx={{ bgcolor: "#f5f5f5", borderRadius: 1, mb: 2 }}>
            {coursePreferences.length > 0 ? (
              coursePreferences.map((pref, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={`${formatPriority(pref.priorityOrder)}: ${getCourseName(
                      pref.course.courseId
                    )}`}
                    secondary={pref.status}
                  />
                  <Chip label={pref.status} />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No course preferences found." />
              </ListItem>
            )}
          </List>

          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
          >
            Uploaded Documents
          </Typography>
          <List dense sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}>
            {documents.length > 0 ? (
              documents.map((doc, idx) => (
                <ListItem key={idx}>
                  <ListItemText primary={doc.fileName || doc.name} />
                  {/* Add download/view buttons as needed */}
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No documents uploaded yet." />
              </ListItem>
            )}
          </List>
        </Paper>
      </Stack>
    </ListLayout>
  );
};

const DetailRow = ({ label, value }) => (
  <Stack direction="row" spacing={1}>
    <Typography fontWeight={500} width={120}>
      {label}:
    </Typography>
    <Typography>{value}</Typography>
  </Stack>
);

export default ViewApplicantPage;
