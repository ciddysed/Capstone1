import React from "react"
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Avatar,
  CircularProgress,
  Chip,
  alpha,
} from "@mui/material"
import {
  Mail as MailIcon,
  Drafts as DraftsIcon,
  Circle as CircleIcon,
  SupervisorAccount as EvaluatorIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from "@mui/icons-material"

const EmailInboxView = ({
  emails = [],
  loading = false,
  onSelectEmail,
  selectedEmailId,
  colors,
  currentUserType = "APPLICANT",
}) => {
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

  const getParticipantInfo = (email) => {
    // Determine if this is an inbox item (received) or sent item
    const isReceived = email.recipientType === currentUserType
    
    if (isReceived) {
      // Show sender info
      return {
        name: email.senderApplicant?.firstName
          ? `${email.senderApplicant.firstName} ${email.senderApplicant.lastName}`
          : email.senderEvaluator?.name || email.senderAdmin?.name || "Unknown",
        role: email.senderType,
        id: email.senderApplicant?.applicantId || 
            email.senderEvaluator?.evaluatorId || 
            email.senderAdmin?.adminId,
      }
    } else {
      // Show recipient info
      return {
        name: email.recipientApplicant?.firstName
          ? `${email.recipientApplicant.firstName} ${email.recipientApplicant.lastName}`
          : email.recipientEvaluator?.name || email.recipientAdmin?.name || "Unknown",
        role: email.recipientType,
        id: email.recipientApplicant?.applicantId || 
            email.recipientEvaluator?.evaluatorId || 
            email.recipientAdmin?.adminId,
      }
    }
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    // Less than 24 hours ago - show time
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // Less than 7 days ago - show day
    if (diff < 604800000) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    
    // Older - show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const truncateBody = (body, maxLength = 100) => {
    if (body.length <= maxLength) return body
    return body.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={40} sx={{ color: colors?.primary?.main || "#6A0000" }} />
      </Box>
    )
  }

  if (emails.length === 0) {
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
          No messages yet
        </Typography>
        <Typography variant="body2" color={colors?.neutral?.[400] || "#aaa"}>
          Your inbox is empty
        </Typography>
      </Box>
    )
  }

  return (
    <List sx={{ p: 0 }}>
      {emails.map((email) => {
        const { subject, body } = parseMessage(email.content)
        const participant = getParticipantInfo(email)
        const RoleIcon = getRoleIcon(participant.role)
        const isSelected = selectedEmailId === email.messageId
        const isReceived = email.recipientType === currentUserType
        const isUnread = isReceived && !email.isRead // Can track locally

        return (
          <ListItem
            key={email.messageId}
            disablePadding
            sx={{
              borderBottom: `1px solid ${colors?.neutral?.[100] || "#f0f0f0"}`,
              bgcolor: isSelected
                ? alpha(colors?.primary?.main || "#6A0000", 0.05)
                : "white",
              "&:hover": {
                bgcolor: isSelected
                  ? alpha(colors?.primary?.main || "#6A0000", 0.08)
                  : colors?.neutral?.[50] || "#fafafa",
              },
            }}
          >
            <ListItemButton
              onClick={() => onSelectEmail(email)}
              sx={{ px: 2.5, py: 1.5 }}
            >
              {/* Unread indicator */}
              {isUnread && (
                <CircleIcon
                  sx={{
                    fontSize: 10,
                    color: colors?.secondary?.main || "#FFC72C",
                    mr: 1.5,
                  }}
                />
              )}

              {/* Avatar */}
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  mr: 2,
                  bgcolor: alpha(
                    participant.role === "EVALUATOR"
                      ? colors?.primary?.main || "#6A0000"
                      : colors?.accent?.info || "#0066CC",
                    0.1
                  ),
                  color:
                    participant.role === "EVALUATOR"
                      ? colors?.primary?.main || "#6A0000"
                      : colors?.accent?.info || "#0066CC",
                }}
              >
                <RoleIcon sx={{ fontSize: 20 }} />
              </Avatar>

              {/* Email Content */}
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={isUnread ? 700 : 600}
                      color={colors?.neutral?.[800] || "#222"}
                      sx={{ flex: 1, mr: 2 }}
                    >
                      {participant.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={colors?.neutral?.[500] || "#888"}
                      sx={{ fontSize: 11 }}
                    >
                      {formatTimestamp(email.sentAt)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={isUnread ? 600 : 400}
                      color={colors?.neutral?.[700] || "#444"}
                      sx={{
                        mb: 0.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {subject}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors?.neutral?.[500] || "#888"}
                      sx={{
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {truncateBody(body)}
                    </Typography>
                  </Box>
                }
              />

              {/* Role Badge */}
              {!isReceived && (
                <Chip
                  label="Sent"
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: 10,
                    bgcolor: colors?.neutral?.[100] || "#f5f5f5",
                    color: colors?.neutral?.[600] || "#666",
                    fontWeight: 600,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        )
      })}
    </List>
  )
}

export default EmailInboxView
