import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
  Divider,
  Paper,
  alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import useResponseHandler from '../../../../utils/useResponseHandler';

// Maroon and Gold theme colors
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

const InterviewScheduleModal = ({ open, onClose, onScheduled }) => {
  const { handleSuccess, handleError } = useResponseHandler();
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'day'));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [interviewType, setInterviewType] = useState('online');
  
  // Fetch available slots for the selected date
  useEffect(() => {
    if (!open) return;
    
    const fetchAvailableSlots = async () => {
      setLoading(true);
      try {
        // In a real application, this would call your API
        // For now, we'll generate mock data
        const response = await mockFetchAvailableSlots(selectedDate);
        setAvailableSlots(response.data);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        handleError("Could not load available interview slots");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableSlots();
  }, [selectedDate, open]);
  
  // Mock function to simulate API call for available slots
  const mockFetchAvailableSlots = async (date) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate 3-6 random time slots for the selected date
    const slots = [];
    const numSlots = Math.floor(Math.random() * 4) + 3; // 3-6 slots
    const startHour = 9; // 9 AM
    
    for (let i = 0; i < numSlots; i++) {
      const hour = startHour + i;
      if (hour > 16) break; // Don't go past 4 PM
      
      slots.push({
        id: `slot-${date.format('YYYY-MM-DD')}-${i}`,
        time: `${hour}:00 - ${hour + 1}:00`,
        available: true
      });
    }
    
    return { data: slots };
  };
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(''); // Reset selected slot when date changes
  };
  
  const handleSlotSelect = (slotId) => {
    setSelectedSlot(slotId);
  };
  
  const handleScheduleInterview = async () => {
    if (!selectedSlot) {
      handleError("Please select a time slot");
      return;
    }
    
    setLoading(true);
    try {
      // In a real application, this would call your API
      // For now, we'll simulate a successful scheduling
      const applicantId = localStorage.getItem('applicantId');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock response data
      const selectedSlotData = availableSlots.find(slot => slot.id === selectedSlot);
      const scheduledInterview = {
        id: `interview-${Date.now()}`,
        applicantId,
        date: selectedDate.format('YYYY-MM-DD'),
        time: selectedSlotData.time,
        type: interviewType,
        location: interviewType === 'online' ? 'Zoom Meeting (link will be sent via email)' : 'Main Campus, Room 305',
        status: 'Scheduled'
      };
      
      handleSuccess("Interview scheduled successfully!");
      onScheduled(scheduledInterview);
      onClose();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      handleError("Failed to schedule interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: maroon.main, 
        color: 'white',
        pb: 2
      }}>
        Schedule Your Interview
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select a date and time slot for your ETEEAP evaluation interview.
          Please ensure you'll be available and in a quiet environment for the interview.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          {/* Date Selection */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              1. Select Interview Date
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Interview Date"
                value={selectedDate}
                onChange={handleDateChange}
                disablePast
                // Don't allow scheduling more than 14 days in advance
                maxDate={dayjs().add(14, 'day')}
                slotProps={{
                  textField: { fullWidth: true, size: "medium" },
                }}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Grid>
          
          {/* Time Slot Selection */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              2. Select Available Time Slot
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} sx={{ color: maroon.main }} />
              </Box>
            ) : availableSlots.length > 0 ? (
              <Grid container spacing={1}>
                {availableSlots.map((slot) => (
                  <Grid item xs={12} sm={6} key={slot.id}>
                    <Paper 
                      elevation={0}
                      onClick={() => handleSlotSelect(slot.id)}
                      sx={{
                        p: 2,
                        border: `1px solid ${selectedSlot === slot.id ? maroon.main : '#e0e0e0'}`,
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: selectedSlot === slot.id ? alpha(maroon.light, 0.1) : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(maroon.light, 0.05),
                          borderColor: alpha(maroon.main, 0.5)
                        }
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        fontWeight={selectedSlot === slot.id ? "medium" : "regular"}
                        color={selectedSlot === slot.id ? maroon.main : "text.primary"}
                      >
                        {slot.time}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper 
                variant="outlined" 
                sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}
              >
                <Typography color="text.secondary">
                  No available slots on this date. Please select another date.
                </Typography>
              </Paper>
            )}
          </Grid>
          
          {/* Interview Type Selection */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              3. Select Interview Type
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
              >
                <FormControlLabel 
                  value="online" 
                  control={<Radio sx={{ color: maroon.main, '&.Mui-checked': { color: maroon.main } }} />} 
                  label="Online (Zoom)" 
                />
                <FormControlLabel 
                  value="in-person" 
                  control={<Radio sx={{ color: maroon.main, '&.Mui-checked': { color: maroon.main } }} />} 
                  label="In-Person" 
                />
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ mt: 1, p: 2, bgcolor: alpha(gold.light, 0.3), borderRadius: 2 }}>
              <Typography variant="body2">
                {interviewType === 'online' ? (
                  "You will receive a Zoom meeting link via email before the interview."
                ) : (
                  "The in-person interview will be held at the Main Campus, Room 305."
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, bgcolor: alpha(maroon.light, 0.05) }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              bgcolor: alpha('#000', 0.05)
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleScheduleInterview}
          variant="contained"
          disabled={!selectedSlot || loading}
          sx={{ 
            bgcolor: maroon.main,
            '&:hover': {
              bgcolor: maroon.dark
            },
            '&.Mui-disabled': {
              bgcolor: alpha(maroon.main, 0.5)
            }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
              Scheduling...
            </>
          ) : (
            "Schedule Interview"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterviewScheduleModal;
