import * as localNotificationService from '../services/localNotificationService';
import notificationService from '../services/notificationService';

/**
 * Add a notification for a specific user
 * @param {string} userType - The type of user (applicant, evaluator, program-admin, system-admin)
 * @param {string} userId - The user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @returns {Object|null} The created notification or null if creation failed
 */
export const addNotification = (userType, userId, title, message, type = 'info') => {
  // Create the notification locally (optimistic/fallback) with a clientTempId
  const clientTempId = `temp_${Date.now()}`;
  const local = localNotificationService.createNotification(userType, userId, {
    title,
    message,
    type,
    clientTempId
  });

  // Attempt to persist the notification to the backend in the background.
  // Payload shape expected by backend: { applicant: { applicantId: <id> }, title, message, type }
  try {
    const applicantId = Number(userId);
    const payload = {
      applicant: { applicantId: applicantId },
      title,
      message,
      // Backend expects enum values like SUCCESS, INFO, WARNING, ERROR
      type: (type || 'info').toString().toUpperCase(),
      // Attach temp id so we can reconcile when server responds; ignored by server if unknown
      clientTempId
    };

    // fire-and-forget, but reconcile local copy when server returns
    notificationService.createNotification(payload)
      .then(serverCreated => {
        try {
          // Replace local optimistic notification with server-provided representation
          localNotificationService.replaceLocalNotification(clientTempId, userType, userId, serverCreated);
          // Notify any listeners (e.g., NotificationCenter) that notifications have been updated
          try {
            window.dispatchEvent(new CustomEvent('notifications:updated', {
              detail: { userType, userId, notification: serverCreated }
            }));
          } catch (evtErr) {
            // Ignore dispatch errors
            console.warn('Failed to dispatch notifications:updated event', evtErr);
          }
        } catch (e) {
          console.warn('Failed to reconcile server notification with local copy:', e);
        }
      })
      .catch(err => {
        // If backend create fails, keep local notification as-is. Log for diagnostics.
        console.warn('Failed to persist notification to backend, using local storage only.', err);
      });
  } catch (err) {
    // Parsing or unexpected errors should not block the UI; local notification is already created.
    console.warn('Notification persistence background task failed to start.', err);
  }

  return local;
};

/**
 * Example usage for different user scenarios
 */
export const notifyApplicationApproved = (applicantId) => {
  return addNotification(
    'applicant',
    applicantId,
    'Application Status Update',
    'Your application has been approved!',
    'success'
  );
};

export const notifyNewEvaluation = (evaluatorId, applicantName) => {
  return addNotification(
    'evaluator',
    evaluatorId,
    'New Application to Evaluate',
    `You have been assigned to evaluate ${applicantName}'s application.`,
    'info'
  );
};

export const notifySystemUpdate = () => {
  // Get all system-admin IDs (you might store these elsewhere)
  const systemAdminId = localStorage.getItem('systemAdminId');
  
  if (systemAdminId) {
    return addNotification(
      'system-admin',
      systemAdminId,
      'System Update',
      'A system maintenance is scheduled for tonight at 10:00 PM.',
      'warning'
    );
  }
  return null;
};

// New notification functions for enrollment process

export const notifyEnrollmentStep = (applicantId, title, message, type = 'info') => {
  return addNotification(
    'applicant',
    applicantId,
    title,
    message,
    type
  );
};

export const notifyDocumentRequired = (applicantId, documentName) => {
  return addNotification(
    'applicant',
    applicantId,
    'Document Required',
    `Please submit your ${documentName} to complete your enrollment.`,
    'warning'
  );
};

export const notifyPaymentDue = (applicantId, amount, dueDate) => {
  return addNotification(
    'applicant',
    applicantId,
    'Payment Due',
    `Your enrollment payment of ₱${amount} is due on ${new Date(dueDate).toLocaleDateString()}.`,
    'warning'
  );
};

export const notifyOrientationSchedule = (applicantId, date, venue) => {
  return addNotification(
    'applicant',
    applicantId,
    'Orientation Schedule',
    `Your orientation is scheduled for ${new Date(date).toLocaleString()} at ${venue}.`,
    'info'
  );
};

export const notifyCourseRegistration = (applicantId) => {
  return addNotification(
    'applicant',
    applicantId,
    'Course Registration Open',
    'You can now register for your courses for the upcoming semester.',
    'info'
  );
};

export const notifyEnrollmentComplete = (applicantId) => {
  return addNotification(
    'applicant',
    applicantId,
    'Enrollment Complete',
    'Congratulations! Your enrollment is now complete.',
    'success'
  );
};
