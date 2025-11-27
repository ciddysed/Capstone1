import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, Divider, IconButton,
  Chip, Alert, CircularProgress, Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  CalendarMonth, 
  AccessTime,
  Delete as DeleteIcon, 
  Edit as EditIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';
import EvaluatorNavigation from '../../../components/Navigation/EvaluatorNavigation';

const InterviewScheduling = () => {
  const [applicants, setApplicants] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState({
    date: null,
    time: null,
    duration: 60,
    meetingLink: '',
    notes: ''
  });
  const [alertMessage, setAlertMessage] = useState({ type: '', message: '' });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [applicantsRes, schedulesRes] = await Promise.all([
          axios.get('https://eteeap-foth.onrender.com/api/applicants/approved'),
          axios.get('https://eteeap-foth.onrender.com/api/interviews')
        ]);
        
        setApplicants(applicantsRes.data);
        setSchedules(schedulesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlertMessage({
          type: 'error',
          message: 'Failed to load data. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDialogOpen = (applicant = null) => {
    setSelectedApplicant(applicant);
    if (applicant) {
      // Check if this applicant already has a scheduled interview
      const existingInterview = schedules.find(
        schedule => schedule.applicantId === applicant.applicantId
      );
      
      if (existingInterview) {
        setInterviewDetails({
          date: dayjs(existingInterview.date),
          time: dayjs(existingInterview.time),
          duration: existingInterview.duration || 60,
          meetingLink: existingInterview.meetingLink || '',
          notes: existingInterview.notes || ''
        });
      } else {
        // Reset form for new interview
        setInterviewDetails({
          date: dayjs(),
          time: dayjs(),
          duration: 60,
          meetingLink: '',
          notes: ''
        });
      }
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedApplicant(null);
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplicant || !interviewDetails.date || !interviewDetails.time) {
      setAlertMessage({
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      return;
    }

    try {
      const payload = {
        applicantId: selectedApplicant.applicantId,
        date: interviewDetails.date.format('YYYY-MM-DD'),
        time: interviewDetails.time.format('HH:mm'),
        duration: interviewDetails.duration,
        meetingLink: interviewDetails.meetingLink,
        notes: interviewDetails.notes
      };

      // Check if updating or creating
      const existingInterview = schedules.find(
        schedule => schedule.applicantId === selectedApplicant.applicantId
      );

      let response;
      if (existingInterview) {
        response = await axios.put(
          `https://eteeap-foth.onrender.com/api/interviews/${existingInterview.id}`,
          payload
        );
        
        // Update the schedules array
        setSchedules(schedules.map(schedule => 
          schedule.id === existingInterview.id ? response.data : schedule
        ));
        
        setAlertMessage({
          type: 'success',
          message: 'Interview schedule updated successfully.'
        });
      } else {
        response = await axios.post('https://eteeap-foth.onrender.com/api/interviews', payload);
        setSchedules([...schedules, response.data]);
        
        setAlertMessage({
          type: 'success',
          message: 'Interview scheduled successfully.'
        });
      }
      
      handleDialogClose();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setAlertMessage({
        type: 'error',
        message: 'Failed to schedule interview. Please try again.'
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await axios.delete(`https://eteeap-foth.onrender.com/api/interviews/${scheduleId}`);
      setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
      
      setAlertMessage({
        type: 'success',
        message: 'Interview schedule deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setAlertMessage({
        type: 'error',
        message: 'Failed to delete schedule. Please try again.'
      });
    }
  };

  return (
    <EvaluatorNavigation>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Interview Scheduling
        </Typography>
        
        {alertMessage.message && (
          <Alert 
            severity={alertMessage.type} 
            sx={{ mb: 3 }}
            onClose={() => setAlertMessage({ type: '', message: '' })}
          >
            {alertMessage.message}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Left Column: Approved Applicants */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Approved Applicants
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Select an applicant to schedule an interview
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : applicants.length > 0 ? (
                  <List>
                    {applicants.map((applicant) => (
                      <React.Fragment key={applicant.applicantId}>
                        <ListItem
                          secondaryAction={
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleDialogOpen(applicant)}
                            >
                              Schedule
                            </Button>
                          }
                        >
                          <ListItemText
                            primary={`${applicant.firstName} ${applicant.lastName}`}
                            secondary={applicant.email}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      No approved applicants found
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right Column: Scheduled Interviews */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Scheduled Interviews
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : schedules.length > 0 ? (
                  <List>
                    {schedules.map((schedule) => {
                      const applicant = applicants.find(
                        a => a.applicantId === schedule.applicantId
                      );
                      
                      return (
                        <Paper 
                          key={schedule.id} 
                          elevation={1} 
                          sx={{ mb: 2, p: 2, borderRadius: 2 }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {applicant 
                                    ? `${applicant.firstName} ${applicant.lastName}`
                                    : 'Unknown Applicant'}
                                </Typography>
                                <Box>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDialogOpen(applicant)}
                                    color="primary"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={6} sm={4}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarMonth fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {dayjs(schedule.date).format('MMM D, YYYY')}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={6} sm={4}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {dayjs(schedule.time, 'HH:mm').format('h:mm A')}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chip 
                                  label={`${schedule.duration} minutes`} 
                                  size="small"
                                  sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}
                                />
                              </Box>
                            </Grid>
                            
                            {schedule.meetingLink && (
                              <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <VideoCallIcon fontSize="small" sx={{ mr: 1, color: '#4caf50' }} />
                                  <Typography 
                                    variant="body2" 
                                    component="a" 
                                    href={schedule.meetingLink} 
                                    target="_blank"
                                    sx={{ color: '#1976d2', textDecoration: 'none' }}
                                  >
                                    Join Meeting Link
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            
                            {schedule.notes && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">
                                  {schedule.notes}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      No interviews scheduled yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Schedule Interview Dialog */}
        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedApplicant ? `Schedule Interview: ${selectedApplicant.firstName} ${selectedApplicant.lastName}` : 'Schedule Interview'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Interview Date"
                    value={interviewDetails.date}
                    onChange={(newValue) => 
                      setInterviewDetails({...interviewDetails, date: newValue})
                    }
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Interview Time"
                    value={interviewDetails.time}
                    onChange={(newValue) => 
                      setInterviewDetails({...interviewDetails, time: newValue})
                    }
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="duration-label">Duration</InputLabel>
                  <Select
                    labelId="duration-label"
                    value={interviewDetails.duration}
                    label="Duration"
                    onChange={(e) => 
                      setInterviewDetails({...interviewDetails, duration: e.target.value})
                    }
                  >
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={45}>45 minutes</MenuItem>
                    <MenuItem value={60}>60 minutes</MenuItem>
                    <MenuItem value={90}>90 minutes</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Link (Optional)"
                  value={interviewDetails.meetingLink}
                  onChange={(e) => 
                    setInterviewDetails({...interviewDetails, meetingLink: e.target.value})
                  }
                  placeholder="https://meet.google.com/..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  value={interviewDetails.notes}
                  onChange={(e) => 
                    setInterviewDetails({...interviewDetails, notes: e.target.value})
                  }
                  multiline
                  rows={3}
                  placeholder="Additional information for the applicant..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button variant="contained" onClick={handleScheduleInterview} color="primary">
              Schedule Interview
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </EvaluatorNavigation>
  );
};

export default InterviewScheduling;
