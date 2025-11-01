const LOCAL_STORAGE_KEY = 'eteeap_notifications';

// Note: auto-generated/mock notifications removed.
// Local storage will start empty and the UI should show no notifications until
// they are created by the backend or via `createNotification`.

export const getNotifications = (userType, userId) => {
  try {
    // Try to get from localStorage first
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    let notifications = storedData ? JSON.parse(storedData) : {};

    // Return user's notifications array or an empty array (no auto-generated mocks)
    const userKey = `${userType}_${userId}`;
    return notifications[userKey] || [];
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
    
    // Allow an optional clientTempId to help reconcile local and server notifications
    const clientTempId = notification.clientTempId || null;

    const newNotification = {
      id: Date.now(), // Simple way to generate unique IDs for local-only items
      clientTempId,
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

/**
 * Replace a local notification (matched by clientTempId) with the server-created one.
 * If no matching local notification is found, the server notification is prepended.
 */
export const replaceLocalNotification = (clientTempId, userType, userId, serverNotification) => {
  if (!clientTempId) return false;

  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const notifications = storedData ? JSON.parse(storedData) : {};
    const userKey = `${userType}_${userId}`;
    if (!notifications[userKey]) {
      notifications[userKey] = [];
    }

    const idx = notifications[userKey].findIndex(n => n.clientTempId === clientTempId);
    const mapped = {
      id: serverNotification.id,
      title: serverNotification.title,
      message: serverNotification.message,
      type: (serverNotification.type || 'INFO').toLowerCase(),
      read: !!serverNotification.read,
      createdAt: serverNotification.createdAt || new Date().toISOString()
    };

    if (idx !== -1) {
      // Replace while preserving ordering
      notifications[userKey][idx] = mapped;
    } else {
      // If not found, add server notification to the front
      notifications[userKey].unshift(mapped);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
    return true;
  } catch (err) {
    console.error('Error replacing local notification with server notification:', err);
    return false;
  }
};
