import axios from 'axios';

const API_URL = 'http://localhost:8080/api/notifications';

// Generate mock notifications for development
const generateMockNotifications = (userId, userType) => {
  const types = ['success', 'info', 'warning', 'error'];
  const now = new Date();
  
  // Different notifications based on user type
  let templates = [];
  
  if (userType === 'applicant') {
    templates = [
      { title: 'Application Status Update', message: 'Your application has been approved!' },
      { title: 'Document Reminder', message: 'Please upload your TOR within 7 days.' },
      { title: 'Interview Scheduled', message: 'You have an interview scheduled for tomorrow at 10:00 AM.' },
      { title: 'Evaluation Complete', message: 'Your application has been evaluated. Check your status.' },
    ];
  } else if (userType === 'evaluator') {
    templates = [
      { title: 'New Application Assigned', message: 'You have a new application to evaluate.' },
      { title: 'Evaluation Deadline', message: 'Please complete your pending evaluations by Friday.' },
      { title: 'Department Meeting', message: 'Program committee meeting scheduled for next week.' },
      { title: 'Document Updated', message: 'An applicant has updated their documents.' },
    ];
  } else {
    // Admin notifications
    templates = [
      { title: 'System Update', message: 'System maintenance scheduled for tonight at 10:00 PM.' },
      { title: 'New Applicants', message: '5 new applications received this week.' },
      { title: 'Evaluator Assignment', message: 'Please assign evaluators to pending applications.' },
      { title: 'Report Ready', message: 'Monthly application report is ready for review.' },
    ];
  }
  
  // Generate 3-7 random notifications
  const count = Math.floor(Math.random() * 5) + 3;
  const notifications = [];
  
  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const daysAgo = Math.floor(Math.random() * 7);
    
    notifications.push({
      id: i + 1,
      title: template.title,
      message: template.message,
      createdAt: new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString(),
      read: Math.random() > 0.4, // 40% chance of being unread
      type,
    });
  }
  
  return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const notificationService = {
  // Get all notifications for a user
  getNotifications: async (userType, userId) => {
    try {
      const response = await axios.get(`${API_URL}/${userType}/${userId}`);
      return response.data;
    } catch (error) {
      console.log('Using mock notifications due to API error:', error);
      return generateMockNotifications(userId, userType);
    }
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      await axios.put(`${API_URL}/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async (userType, userId) => {
    try {
      await axios.put(`${API_URL}/${userType}/${userId}/read-all`);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },
  
  // Create a new notification (for admin use)
  createNotification: async (notification) => {
    try {
      const response = await axios.post(API_URL, notification);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
};

export default notificationService;
