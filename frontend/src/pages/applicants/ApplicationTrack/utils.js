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

// Document type labels for mapping backend enum values to user-friendly names
export const DOCUMENT_TYPE_LABELS = {
  APPLICANTS_EVALUATION_SHEET: "Applicant's Evaluation Sheet",
  INFORMATIVE_COPY_OF_TOR: "Informative Copy of TOR",
  PSA_AUTHENTICATED_BIRTH_CERTIFICATE: "PSA Birth Certificate",
  CERTIFICATE_OF_TRANSFER_CREDENTIAL: "Certificate of Transfer Credential",
  MARRIAGE_CERTIFICATE: "Marriage Certificate", 
  CERTIFICATE_OF_EMPLOYMENT: "Certificate of Employment",
  EMPLOYER_CERTIFIED_DETAILED_JOB_DESCRIPTION: "Employer Certified Job Description",
  EVIDENCE_OF_BUSINESS_OWNERSHIP: "Evidence of Business Ownership",
  GENERAL: "General Document",
};

// Get document type label from document type value
export const getDocumentTypeLabel = (documentType) => {
  return DOCUMENT_TYPE_LABELS[documentType] || documentType || "General Document";
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

// Function to get status color based on preference status
export const getStatusColor = (status) => {
  switch(status) {
    case PREFERENCE_STATUS.ACCEPTED:
      return { bg: "rgba(76, 175, 80, 0.1)", color: "#2e7d32", border: "#4caf50" };
    case PREFERENCE_STATUS.REJECTED:
      return { bg: "rgba(244, 67, 54, 0.1)", color: "#d32f2f", border: "#f44336" };
    case PREFERENCE_STATUS.REVIEWED:
      return { bg: "rgba(33, 150, 243, 0.1)", color: "#1565c0", border: "#2196f3" };
    case PREFERENCE_STATUS.PENDING:
    default:
      return { bg: "rgba(255, 152, 0, 0.1)", color: "#e65100", border: "#ff9800" };
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