import React from "react";
import {
  PictureAsPdf,
  Article,
  Image,
  InsertDriveFile,
  CheckCircle,
  Error,
  AccessTime
} from "@mui/icons-material";

// Application and preference statuses
export const APPLICATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED"
};

export const PREFERENCE_STATUS = {
  PENDING: "PENDING",
  REVIEWED: "REVIEWED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED"
};

export const PRIORITY_ORDER = {
  FIRST: "FIRST",
  SECOND: "SECOND",
  THIRD: "THIRD"
};

// Document types and their corresponding icons
export const DOCUMENT_TYPES = {
  PDF: { 
    icon: <PictureAsPdf sx={{ color: "#D32F2F" }} />, 
    mimeType: "application/pdf" 
  },
  DOCX: { 
    icon: <Article sx={{ color: "#1565C0" }} />, 
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
  },
  DOC: { 
    icon: <Article sx={{ color: "#1565C0" }} />, 
    mimeType: "application/msword" 
  },
  IMAGE: { 
    icon: <Image sx={{ color: "#4CAF50" }} />, 
    mimeType: "image/*" 
  },
  OTHER: { 
    icon: <InsertDriveFile sx={{ color: "#757575" }} />, 
    mimeType: "application/octet-stream" 
  }
};

// Get initials from name
export const getInitials = (name) =>
  name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

// Get document type from filename
export const getDocumentType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  if (extension === 'pdf') return 'PDF';
  if (['doc', 'docx'].includes(extension)) return extension === 'doc' ? 'DOC' : 'DOCX';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) return 'IMAGE';
  return 'OTHER';
};

// Status icon
export const getStatusIcon = (status) => {
  switch(status) {
    case APPLICATION_STATUS.APPROVED:
    case PREFERENCE_STATUS.ACCEPTED:
      return <CheckCircle fontSize="small" sx={{ color: "#2E7D32" }} />;
    case APPLICATION_STATUS.REJECTED:
    case PREFERENCE_STATUS.REJECTED:
      return <Error fontSize="small" sx={{ color: "#C62828" }} />;
    case APPLICATION_STATUS.PENDING:
    case PREFERENCE_STATUS.PENDING:
    case PREFERENCE_STATUS.REVIEWED:
    default:
      return <AccessTime fontSize="small" sx={{ color: "#1565C0" }} />;
  }
};

// Priority formatting
export const formatPriority = (priority) => {
  const formats = {
    [PRIORITY_ORDER.FIRST]: "Course 1",
    [PRIORITY_ORDER.SECOND]: "Course 2",
    [PRIORITY_ORDER.THIRD]: "Course 3"
  };
  return formats[priority] || priority;
};