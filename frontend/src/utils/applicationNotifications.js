import { addNotification } from './notificationManager';

// Helper function to create application status notifications
export const createApplicationStatusNotification = (applicantId, status, message) => {
  let title = 'Application Status Update';
  let type = 'info';

  switch (status) {
    case 'APPROVED':
      title = 'Application Approved!';
      type = 'success';
      break;
    case 'REJECTED':
      title = 'Application Status: Not Approved';
      type = 'error';
      break;
    case 'UNDER_REVIEW':
      title = 'Application Under Review';
      type = 'info';
      break;
    case 'PENDING':
      title = 'Application Pending';
      type = 'warning';
      break;
    default:
      title = 'Application Status Update';
  }

  return addNotification(
    'applicant',
    applicantId,
    title,
    message || `Your application status has been updated to: ${status}`,
    type
  );
};

// Notification for document verification
export const createDocumentVerificationNotification = (applicantId, documentType, isVerified) => {
  const title = isVerified 
    ? 'Document Verified' 
    : 'Document Needs Attention';
  
  const message = isVerified
    ? `Your ${formatDocumentType(documentType)} has been verified.`
    : `Your ${formatDocumentType(documentType)} requires your attention.`;
  
  const type = isVerified ? 'success' : 'warning';

  return addNotification('applicant', applicantId, title, message, type);
};

// Notification for interview scheduling
export const createInterviewNotification = (applicantId, date, time, method) => {
  const formattedDate = new Date(date).toLocaleDateString();
  const title = 'Interview Scheduled';
  const message = `Your interview has been scheduled for ${formattedDate} at ${time}. Method: ${method}`;

  return addNotification('applicant', applicantId, title, message, 'info');
};

// Helper function to format document type for display
const formatDocumentType = (type) => {
  if (!type) return "document";
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
