import React from "react"
import PropTypes from "prop-types"
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Paper,
  Divider,
  Button,
  CircularProgress,
  alpha,
} from "@mui/material"
import {
  ArrowBack as BackIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  SupervisorAccount as EvaluatorIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from "@mui/icons-material"

const ConversationDetailView = ({
  conversation,
  messages = [],
  loading = false,
  onBack,
  onReply,
  onDeleteMessage,
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

  const getRoleIcon = (role) => {
    switch (role) {
      case "EVALUATOR":
        return EvaluatorIcon
      case "PROGRAM_ADMIN":
        return AdminIcon
      case "APPLICANT":
        return PersonIcon
      default:
        return PersonIcon
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], {
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric'
      })
    }
  }

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {}
    messages.forEach(msg => {
      const dateKey = new Date(msg.sentAt).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(msg)
    })
    return groups
  }

  const messageGroups = groupMessagesByDate()
  const RoleIcon = getRoleIcon(conversation?.participantRole)

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", py: 8 }}>
        <CircularProgress size={40} sx={{ color: colors?.primary?.main || "#6A0000" }} />
      </Box>
    )
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${colors?.neutral?.[200] || "#eee"}`,
          bgcolor: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <IconButton size="small" onClick={onBack}>
          <BackIcon />
        </IconButton>

        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: alpha(
              conversation?.participantRole === "EVALUATOR"
                ? colors?.primary?.main || "#6A0000"
                : colors?.accent?.info || "#0066CC",
              0.1
            ),
            color:
              conversation?.participantRole === "EVALUATOR"
                ? colors?.primary?.main || "#6A0000"
                : colors?.accent?.info || "#0066CC",
          }}
        >
          <RoleIcon sx={{ fontSize: 20 }} />
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} color={colors?.neutral?.[800]}>
            {conversation?.participantName}
          </Typography>
          <Typography variant="caption" color={colors?.neutral?.[500]}>
            {conversation?.participantRole?.replace('_', ' ')} • {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<ReplyIcon />}
          onClick={onReply}
          sx={{
            bgcolor: colors?.primary?.main || "#6A0000",
            "&:hover": {
              bgcolor: colors?.primary?.dark || "#4A0000",
            },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Reply
        </Button>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          bgcolor: colors?.neutral?.[50] || "#f9f9f9",
        }}
      >
        {Object.entries(messageGroups).map(([dateKey, msgs]) => (
          <Box key={dateKey} sx={{ mb: 3 }}>
            {/* Date Divider */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 0.5,
                  bgcolor: colors?.neutral?.[200] || "#e0e0e0",
                  borderRadius: 1,
                  fontWeight: 600,
                  color: colors?.neutral?.[700] || "#444",
                }}
              >
                {formatDate(msgs[0].sentAt)}
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            {/* Messages for this date */}
            {msgs.map((message) => {
              const { subject, body } = parseMessage(message.content)
              const isSent = message.senderType === currentUserType

              return (
                <Paper
                  key={message.messageId}
                  elevation={0}
                  sx={{
                    mb: 2,
                    p: 2.5,
                    bgcolor: "white",
                    border: `1px solid ${colors?.neutral?.[200] || "#eee"}`,
                    borderLeft: isSent
                      ? `4px solid ${colors?.accent?.success || "#4CAF50"}`
                      : `4px solid ${colors?.primary?.main || "#6A0000"}`,
                  }}
                >
                  {/* Message Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        color={colors?.neutral?.[800] || "#222"}
                        sx={{ mb: 0.5 }}
                      >
                        {isSent ? "You" : conversation?.participantName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={colors?.neutral?.[500] || "#888"}
                      >
                        {formatTimestamp(message.sentAt)}
                      </Typography>
                    </Box>
                    {isSent && onDeleteMessage && (
                      <IconButton
                        size="small"
                        onClick={() => onDeleteMessage(message.messageId)}
                        sx={{
                          color: colors?.neutral?.[500],
                          "&:hover": {
                            color: colors?.accent?.error || "#f44336",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Subject */}
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color={colors?.neutral?.[900] || "#000"}
                    sx={{ mb: 1.5 }}
                  >
                    {subject}
                  </Typography>

                  {/* Body */}
                  <Typography
                    variant="body2"
                    color={colors?.neutral?.[700] || "#444"}
                    sx={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                    }}
                  >
                    {body}
                  </Typography>
                </Paper>
              )
            })}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

ConversationDetailView.propTypes = {
  conversation: PropTypes.shape({
    participantRole: PropTypes.string,
    participantName: PropTypes.string,
  }),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      messageId: PropTypes.number,
      content: PropTypes.string,
      sentAt: PropTypes.string,
      senderType: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  onBack: PropTypes.func,
  onReply: PropTypes.func,
  onDeleteMessage: PropTypes.func,
  colors: PropTypes.shape({
    primary: PropTypes.shape({
      main: PropTypes.string,
      dark: PropTypes.string,
    }),
    accent: PropTypes.shape({
      success: PropTypes.string,
      error: PropTypes.string,
      info: PropTypes.string,
    }),
    neutral: PropTypes.objectOf(PropTypes.string),
  }),
  currentUserType: PropTypes.string,
}

export default ConversationDetailView
