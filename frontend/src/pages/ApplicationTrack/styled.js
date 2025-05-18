import { Paper, Chip, Box, Button, ListItem, Avatar, Modal, Stack, Badge } from "@mui/material";
import { styled } from "@mui/material/styles";
import { APPLICATION_STATUS, PREFERENCE_STATUS } from "./utils";

// Styled components
export const TrackingPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  width: "100%",
  maxWidth: 800,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease-in-out",
}));

export const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    [APPLICATION_STATUS.PENDING]: { bg: "#FFF9C4", color: "#827717" },
    [APPLICATION_STATUS.APPROVED]: { bg: "#C8E6C9", color: "#2E7D32" },
    [APPLICATION_STATUS.REJECTED]: { bg: "#FFCDD2", color: "#C62828" },
    [APPLICATION_STATUS.DRAFT]: { bg: "#E0E0E0", color: "#424242" },
    [APPLICATION_STATUS.SUBMITTED]: { bg: "#BBDEFB", color: "#1565C0" },
  };
  const statusColor = colors[status] || colors[APPLICATION_STATUS.PENDING];
  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: "bold",
    borderRadius: 16,
    padding: "4px 12px",
  };
});

export const PreferenceStatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    [PREFERENCE_STATUS.PENDING]: { bg: "#FFF9C4", color: "#827717" },
    [PREFERENCE_STATUS.REVIEWED]: { bg: "#BBDEFB", color: "#1565C0" },
    [PREFERENCE_STATUS.ACCEPTED]: { bg: "#C8E6C9", color: "#2E7D32" },
    [PREFERENCE_STATUS.REJECTED]: { bg: "#FFCDD2", color: "#C62828" },
  };
  const statusColor = colors[status] || colors[PREFERENCE_STATUS.PENDING];
  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: "bold",
    borderRadius: 16,
    fontSize: "0.75rem",
  };
});

export const CourseBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: "#f5f5f5",
  marginBottom: theme.spacing(1.5),
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  }
}));

export const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#222222",
  color: "white",
  borderRadius: 8,
  textTransform: "none",
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "#000000",
  },
  "&:disabled": {
    backgroundColor: "#cccccc",
  }
}));

export const DocumentItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 8,
  marginBottom: theme.spacing(1),
  backgroundColor: "#f9f9f9",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#f0f0f0",
    transform: "translateX(4px)",
  }
}));

export const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  backgroundColor: "#333",
  fontSize: "1rem",
}));

export const InfoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: "#fafafa",
  marginBottom: theme.spacing(2),
}));

export const PreviewModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const PreviewContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  padding: theme.spacing(3),
  position: "relative",
  maxWidth: "95%",
  maxHeight: "90vh",
  width: "auto",
  height: "auto",
  outline: "none",
  display: "flex",
  flexDirection: "column",
}));

export const PreviewHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const PreviewContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "300px",
  backgroundColor: "#f5f5f5",
  borderRadius: 8,
}));

export const DocumentBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
    backgroundColor: "#2196F3",
  },
}));