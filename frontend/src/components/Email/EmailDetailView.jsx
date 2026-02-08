import React from "react"
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Button,
  Chip,
  alpha,
  CircularProgress,
} from "@mui/material"
import {
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  SupervisorAccount as EvaluatorIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Mail as MailIcon,
} from "@mui/icons-material"

const EmailDetailView = ({
  email,
  onBack,
  onReply,
  onDelete,
  loading = false,
  colors,
  currentUserType = "APPLICANT",
}) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={40} sx={{ color: colors?.primary?.main || "#6A0000" }} />
      </Box>
    )
  }

  if (!email) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 3,
        }}
      >
        <MailIcon
          sx={{
            fontSize: 64,
            color: colors?.neutral?.[300] || "#ccc",
            mb: 2,
          }}
        />
        <Typography variant="h6" color={colors?.neutral?.[500] || "#888"} gutterBottom>
          No message selected
        </Typography>
        <Typography variant="body2" color={colors?.neutral?.[400] || "#aaa"}>
          Select a message to view its contents
        </Typography>
      </Box>
    )
  }

  const parseMessage = (content) => {
    try {
      const parsed = JSON.parse(content)
      return {
        subject: parsed.subject || "(No Subject)",
        body: parsed.body || content,
      }
    } catch {
      return {
        subject: "(No Subject)",
        body: content,
      }
    }
  }

  const { subject, body } = parseMessage(email.content)
  const isReceived = email.recipientType === currentUserType

  const getSenderInfo = () => {
    if (email.senderApplicant) {
      return {
        name: `${email.senderApplicant.firstName} ${email.senderApplicant.lastName}`,
        email: email.senderApplicant.email,
        role: "APPLICANT",
      }
    } else if (email.senderEvaluator) {
      return {
        name: email.senderEvaluator.name,
        email: email.senderEvaluator.email,
        role: "EVALUATOR",
      }
    } else if (email.senderAdmin) {
      return {
        name: email.senderAdmin.name,
        email: email.senderAdmin.email,
        role: "PROGRAM_ADMIN",
      }
    }
    return { name: "Unknown", email: "", role: "UNKNOWN" }
  }

  const getRecipientInfo = () => {
    if (email.recipientApplicant) {
      return {
        name: `${email.recipientApplicant.firstName} ${email.recipientApplicant.lastName}`,
        email: email.recipientApplicant.email,
        role: "APPLICANT",
      }
    } else if (email.recipientEvaluator) {
      return {
        name: email.recipientEvaluator.name,
        email: email.recipientEvaluator.email,
        role: "EVALUATOR",
      }
    } else if (email.recipientAdmin) {
      return {
        name: email.recipientAdmin.name,
        email: email.recipientAdmin.email,
        role: "PROGRAM_ADMIN",
      }
    }
    return { name: "Unknown", email: "", role: "UNKNOWN" }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "EVALUATOR":
        return EvaluatorIcon
      case "PROGRAM_ADMIN":
        return AdminIcon
      case "APPLICANT":
        return PersonIcon
      default:
        return MailIcon
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "EVALUATOR":
        return "Evaluator"
      case "PROGRAM_ADMIN":
        return "Program Admin"
      case "APPLICANT":
        return "Applicant"
      default:
        return "Unknown"
    }
  }

  const formatDetailedTimestamp = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const sender = getSenderInfo()
  const recipient = getRecipientInfo()
  const SenderIcon = getRoleIcon(sender.role)

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "white",
      }}
    >
      {/* Header with actions */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${colors?.neutral?.[200] || "#eee"}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <IconButton size="small" onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        
        <Box sx={{ flex: 1 }} />

        {isReceived && (
          <Button
            size="small"
            startIcon={<ReplyIcon />}
            onClick={onReply}
            sx={{
              textTransform: "none",
              color: colors?.primary?.main || "#6A0000",
            }}
          >
            Reply
          </Button>
        )}

        {onDelete && (
          <IconButton size="small" onClick={onDelete} sx={{ color: colors?.neutral?.[600] }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Email Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 3,
        }}
      >
        {/* Subject */}
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          color={colors?.neutral?.[900] || "#000"}
          sx={{ mb: 3 }}
        >
          {subject}
        </Typography>

        {/* Sender Info */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              bgcolor: alpha(
                sender.role === "EVALUATOR"
                  ? colors?.primary?.main || "#6A0000"
                  : colors?.accent?.info || "#0066CC",
                0.1
              ),
              color:
                sender.role === "EVALUATOR"
                  ? colors?.primary?.main || "#6A0000"
                  : colors?.accent?.info || "#0066CC",
            }}
          >
            <SenderIcon sx={{ fontSize: 24 }} />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600} color={colors?.neutral?.[800]}>
                {sender.name}
              </Typography>
              <Chip
                label={getRoleDisplayName(sender.role)}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 10,
                  bgcolor: colors?.neutral?.[100] || "#f5f5f5",
                  color: colors?.neutral?.[600] || "#666",
                }}
              />
            </Box>
            
            <Typography variant="body2" color={colors?.neutral?.[600]} sx={{ mb: 0.5 }}>
              <strong>From:</strong> {sender.email || "N/A"}
            </Typography>
            
            <Typography variant="body2" color={colors?.neutral?.[600]} sx={{ mb: 0.5 }}>
              <strong>To:</strong> {recipient.email || "N/A"}
            </Typography>
            
            <Typography variant="caption" color={colors?.neutral?.[500]}>
              {formatDetailedTimestamp(email.sentAt)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Email Body */}
        <Box
          sx={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            lineHeight: 1.7,
            color: colors?.neutral?.[800] || "#333",
            fontSize: 14,
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {body}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default EmailDetailView
