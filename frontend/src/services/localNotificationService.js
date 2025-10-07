const LOCAL_STORAGE_KEY = 'eteeap_notifications';

// Generate random mock notifications for a user
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

export const getNotifications = (userType, userId) => {
  try {
    // Try to get from localStorage first
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    let notifications = storedData ? JSON.parse(storedData) : {};
    
    // Initialize user's notifications if they don't exist
    const userKey = `${userType}_${userId}`;
    if (!notifications[userKey]) {
      notifications[userKey] = generateMockNotifications(userId, userType);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
    }
    
    return notifications[userKey];
  } catch (error) {
    console.error('Error getting notifications from localStorage:', error);
    return [];
  }
};

export const markAsRead = (notificationId) => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedData) return false;
    
    const notifications = JSON.parse(storedData);
    
    // Find notification in all user arrays
    let updated = false;
    Object.keys(notifications).forEach(userKey => {
      const userNotifications = notifications[userKey];
      const notificationIndex = userNotifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex !== -1) {
        userNotifications[notificationIndex].read = true;
        updated = true;
      }
    });
    
    if (updated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const markAllAsRead = (userType, userId) => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedData) return false;
    
    const notifications = JSON.parse(storedData);
    const userKey = `${userType}_${userId}`;
    
    if (notifications[userKey]) {
      notifications[userKey] = notifications[userKey].map(n => ({...n, read: true}));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

export const createNotification = (userType, userId, notification) => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const notifications = storedData ? JSON.parse(storedData) : {};
    
    const userKey = `${userType}_${userId}`;
    if (!notifications[userKey]) {
      notifications[userKey] = [];
    }
    
    const newNotification = {
      id: Date.now(), // Simple way to generate unique IDs
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    
    notifications[userKey].unshift(newNotification); // Add to beginning
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
    
    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
