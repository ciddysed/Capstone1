/**
 * Subject Notification Service
 * Handles real-time notifications for subject evaluation status changes
 */

import { addNotification } from '../utils/notificationManager';

const NOTIFICATION_STORAGE_KEY = 'eteeap_subject_notifications';
const CHECK_INTERVAL = 30000; // Check every 30 seconds

/**
 * Initialize subject status tracking for an applicant
 */
export const initializeSubjectTracking = (applicantId, subjects) => {
  try {
    const tracking = getSubjectTracking();
    const applicantTracking = {};
    
    subjects.forEach(subject => {
      applicantTracking[subject.id] = {
        status: subject.status,
        lastChecked: new Date().toISOString(),
        subjectCode: subject.subject.subjectCode,
        descriptiveTitle: subject.subject.descriptiveTitle
      };
    });
    
    tracking[applicantId] = applicantTracking;
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(tracking));
    
    return true;
  } catch (error) {
    console.error('Error initializing subject tracking:', error);
    return false;
  }
};

/**
 * Get current subject tracking data
 */
const getSubjectTracking = () => {
  try {
    const data = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting subject tracking:', error);
    return {};
  }
};

/**
 * Check for subject status changes and create notifications
 */
export const checkForStatusChanges = async (applicantId, currentSubjects) => {
  try {
    const tracking = getSubjectTracking();
    const applicantTracking = tracking[applicantId] || {};
    const notifications = [];
    
    currentSubjects.forEach(subject => {
      const previousData = applicantTracking[subject.id];
      
      if (previousData && previousData.status !== subject.status) {
        // Status changed - create notification
        const notification = createStatusChangeNotification(
          applicantId,
          subject,
          previousData.status,
          subject.status
        );
        
        if (notification) {
          notifications.push(notification);
        }
        
        // Update tracking
        applicantTracking[subject.id] = {
          status: subject.status,
          lastChecked: new Date().toISOString(),
          subjectCode: subject.subject.subjectCode,
          descriptiveTitle: subject.subject.descriptiveTitle
        };
      } else if (!previousData) {
        // New subject found - initialize
        applicantTracking[subject.id] = {
          status: subject.status,
          lastChecked: new Date().toISOString(),
          subjectCode: subject.subject.subjectCode,
          descriptiveTitle: subject.subject.descriptiveTitle
        };
      }
    });
    
    // Save updated tracking
    tracking[applicantId] = applicantTracking;
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(tracking));
    
    return notifications;
  } catch (error) {
    console.error('Error checking for status changes:', error);
    return [];
  }
};

/**
 * Create notification for status change
 */
const createStatusChangeNotification = (applicantId, subject, oldStatus, newStatus) => {
  const subjectName = `${subject.subject.subjectCode} - ${subject.subject.descriptiveTitle}`;
  
  let title = 'Subject Status Update';
  let message = '';
  let type = 'info';
  
  switch (newStatus) {
    case 'APPROVED':
      title = '✅ Subject Approved!';
      message = `Great news! "${subjectName}" has been approved and accredited.`;
      type = 'success';
      break;
      
    case 'REJECTED':
      title = '❌ Subject Not Approved';
      message = `"${subjectName}" was not accredited. Please review the evaluation details.`;
      type = 'error';
      break;
      
    case 'PENDING':
      title = '⏳ Subject Under Review';
      message = `"${subjectName}" is now under evaluation. You will be notified of the result.`;
      type = 'warning';
      break;
      
    default:
      message = `Status of "${subjectName}" changed from ${oldStatus} to ${newStatus}.`;
  }
  
  return addNotification('applicant', applicantId, title, message, type);
};

/**
 * Get notification summary for dashboard
 */
export const getNotificationSummary = (applicantId) => {
  try {
    const tracking = getSubjectTracking();
    const applicantTracking = tracking[applicantId] || {};
    
    const subjects = Object.values(applicantTracking);
    
    return {
      totalTracked: subjects.length,
      approved: subjects.filter(s => s.status === 'APPROVED').length,
      pending: subjects.filter(s => s.status === 'PENDING').length,
      rejected: subjects.filter(s => s.status === 'REJECTED').length,
      lastCheck: subjects.length > 0 
        ? new Date(Math.max(...subjects.map(s => new Date(s.lastChecked)))).toISOString()
        : null
    };
  } catch (error) {
    console.error('Error getting notification summary:', error);
    return null;
  }
};

/**
 * Clear subject tracking for an applicant
 */
export const clearSubjectTracking = (applicantId) => {
  try {
    const tracking = getSubjectTracking();
    delete tracking[applicantId];
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(tracking));
    return true;
  } catch (error) {
    console.error('Error clearing subject tracking:', error);
    return false;
  }
};

/**
 * Start polling for status changes
 */
export const startStatusPolling = (applicantId, fetchSubjects, onNewNotifications) => {
  const intervalId = setInterval(async () => {
    try {
      const subjects = await fetchSubjects();
      const notifications = await checkForStatusChanges(applicantId, subjects);
      
      if (notifications.length > 0 && onNewNotifications) {
        onNewNotifications(notifications);
      }
    } catch (error) {
      console.error('Error polling for status changes:', error);
    }
  }, CHECK_INTERVAL);
  
  return intervalId;
};

/**
 * Stop polling for status changes
 */
export const stopStatusPolling = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};
