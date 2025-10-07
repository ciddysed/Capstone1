import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  CircularProgress, useTheme, alpha 
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import SystemAdminNavigation from '../../../components/Navigation/SystemAdminNavigation';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportingDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    applicationsOverTime: { labels: [], data: [] },
    applicationsByStatus: { labels: [], data: [] },
    coursePreferences: { labels: [], data: [] }
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [applicationsData, statusData, coursesData] = await Promise.all([
          axios.get('http://localhost:8080/api/reports/applications-over-time'),
          axios.get('http://localhost:8080/api/reports/applications-by-status'),
          axios.get('http://localhost:8080/api/reports/course-preferences')
        ]);
        
        setMetrics({
          applicationsOverTime: applicationsData.data,
          applicationsByStatus: statusData.data,
          coursePreferences: coursesData.data
        });
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
    },
  };
  
  // Applications over time chart data
  const lineChartData = {
    labels: metrics.applicationsOverTime.labels,
    datasets: [
      {
        label: 'Applications',
        data: metrics.applicationsOverTime.data,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.5),
      }
    ],
  };
  
  // Applications by status chart data
  const doughnutData = {
    labels: metrics.applicationsByStatus.labels,
    datasets: [
      {
        data: metrics.applicationsByStatus.data,
        backgroundColor: [
          '#4CAF50', // Approved
          '#F44336', // Rejected
          '#FFC107', // Pending
          '#2196F3', // Under Review
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Course preferences chart data
  const barChartData = {
    labels: metrics.coursePreferences.labels,
    datasets: [
      {
        label: 'Applications',
        data: metrics.coursePreferences.data,
        backgroundColor: alpha(theme.palette.secondary.main, 0.7),
      }
    ],
  };
  
  if (loading) {
    return (
      <SystemAdminNavigation activeTab="Reports">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </SystemAdminNavigation>
    );
  }
  
  return (
    <SystemAdminNavigation activeTab="Reports">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Analytics Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          {/* Applications Over Time */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Applications Over Time
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line options={chartOptions} data={lineChartData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Applications By Status */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Applications By Status
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={doughnutData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Course Preferences */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top Course Preferences
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar options={chartOptions} data={barChartData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </SystemAdminNavigation>
  );
};

export default ReportingDashboard;
