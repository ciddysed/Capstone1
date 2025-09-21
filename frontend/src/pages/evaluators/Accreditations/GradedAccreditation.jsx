import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

const GradedAccreditation = () => {
  const location = useLocation();
  const { applicantId, curriculumId } = location.state || {};
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editFields, setEditFields] = useState({
    grade: "",
    processOfAccreditation: "",
    substantiveBasis: "",
    status: "",
  });

  useEffect(() => {
    if (applicantId) {
      setLoading(true);
      axios
        .get(`${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`)
        .then((res) => {
          setRecords(res.data);
        })
        .catch(() => setRecords([]))
        .finally(() => setLoading(false));
    }
  }, [applicantId]);

  // Accreditation function (bulk create records from curriculum)
  const handleCreateCurriculumRecord = async () => {
    if (!applicantId || !curriculumId) return;
    try {
      await axios.post(
        `${API_BASE}/applicants/${applicantId}/create-curriculum-record?curriculumId=${curriculumId}`
      );
      // Refresh records
      axios
        .get(`${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`)
        .then((res) => setRecords(res.data));
      alert("Curriculum records created successfully.");
    } catch (err) {
      alert("Failed to create curriculum records.");
    }
  };

  // Edit record dialog handlers
  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setEditFields({
      grade: record.grade || "",
      processOfAccreditation: record.processOfAccreditation || "",
      substantiveBasis: record.substantiveBasis || "",
      status: record.status || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    try {
      await axios.put(`${API_BASE}/applicant-subject-records/${selectedRecord.id}`, editFields);
      setEditDialogOpen(false);
      // Refresh records
      axios
        .get(`${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`)
        .then((res) => setRecords(res.data));
      alert("Record updated.");
    } catch (err) {
      alert("Failed to update record.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Graded Accreditation Record
      </Typography>
      
      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading records...</Typography>
        </Box>
      ) : (
        Object.keys(records).map((semester) => (
          <Paper key={semester} sx={{ mt: 3, p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {semester}
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Process</TableCell>
                  <TableCell>Basis</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records[semester].map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>{rec.subject?.descriptiveTitle}</TableCell>
                    <TableCell>{rec.grade || "-"}</TableCell>
                    <TableCell>{rec.processOfAccreditation || "-"}</TableCell>
                    <TableCell>{rec.substantiveBasis || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={rec.status}
                        color={
                          rec.status === "APPROVED"
                            ? "success"
                            : rec.status === "REJECTED"
                            ? "error"
                            : "warning"
                        }
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditClick(rec)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ))
      )}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Subject Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Grade"
              value={editFields.grade}
              onChange={(e) => handleEditFieldChange("grade", e.target.value)}
              fullWidth
            />
            <TextField
              label="Process of Accreditation"
              value={editFields.processOfAccreditation}
              onChange={(e) => handleEditFieldChange("processOfAccreditation", e.target.value)}
              fullWidth
            />
            <TextField
              label="Substantive Basis"
              value={editFields.substantiveBasis}
              onChange={(e) => handleEditFieldChange("substantiveBasis", e.target.value)}
              fullWidth
            />
            <TextField
              label="Status"
              value={editFields.status}
              onChange={(e) => handleEditFieldChange("status", e.target.value)}
              fullWidth
              select
            >
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="APPROVED">APPROVED</MenuItem>
              <MenuItem value="REJECTED">REJECTED</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradedAccreditation;
