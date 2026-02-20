import React from "react"
import PropTypes from "prop-types"
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
  Badge,
  alpha,
} from "@mui/material"
import {
  Mail as MailIcon,
  Circle as CircleIcon,
  SupervisorAccount as EvaluatorIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from "@mui/icons-material"

const ConversationListView = ({
  conversations = [],
  loading = false,
  onSelectConversation,
  selectedParticipantId,
  colors,
  currentUserType = "APPLICANT",
}) => {
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

  const truncateMessage = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={40} sx={{ color: colors?.primary?.main || "#6A0000" }} />
      </Box>
    )
  }

  if (conversations.length === 0) {
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
          No conversations yet
        </Typography>
        <Typography variant="body2" color={colors?.neutral?.[400] || "#aaa"}>
          Start a new conversation by composing a message
        </Typography>
      </Box>
    )
  }

  return (
    <List sx={{ p: 0 }}>
      {conversations.map((conversation) => {
        const { subject, body } = parseMessage(conversation.lastMessage.content)
        const RoleIcon = getRoleIcon(conversation.participantRole)
        const isSelected = selectedParticipantId === `${conversation.participantId}-${conversation.participantRole}`
        
        return (
          <ListItem
            key={`${conversation.participantId}-${conversation.participantRole}`}
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
              onClick={() => onSelectConversation(conversation)}
              sx={{ px: 2.5, py: 1.5 }}
            >
              {/* Unread indicator */}
              {conversation.unreadCount > 0 && (
                <Badge
                  badgeContent={conversation.unreadCount}
                  color="secondary"
                  sx={{
                    mr: 1,
                    "& .MuiBadge-badge": {
                      bgcolor: colors?.secondary?.main || "#FFC72C",
                      color: colors?.neutral?.[900] || "#000",
                      fontWeight: 700,
                      fontSize: 11,
                    },
                  }}
                >
                  <CircleIcon
                    sx={{
                      fontSize: 10,
                      color: colors?.secondary?.main || "#FFC72C",
                    }}
                  />
                </Badge>
              )}

              {/* Avatar */}
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  mr: 2,
                  bgcolor: alpha(
                    conversation.participantRole === "EVALUATOR"
                      ? colors?.primary?.main || "#6A0000"
                      : colors?.accent?.info || "#0066CC",
                    0.1
                  ),
                  color:
                    conversation.participantRole === "EVALUATOR"
                      ? colors?.primary?.main || "#6A0000"
                      : colors?.accent?.info || "#0066CC",
                }}
              >
                <RoleIcon sx={{ fontSize: 24 }} />
              </Avatar>

              {/* Conversation Content */}
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
                      variant="body1"
                      fontWeight={conversation.unreadCount > 0 ? 700 : 600}
                      color={colors?.neutral?.[800] || "#222"}
                      sx={{ flex: 1, mr: 2 }}
                    >
                      {conversation.participantName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={colors?.neutral?.[500] || "#888"}
                      sx={{ fontSize: 11 }}
                    >
                      {formatTimestamp(conversation.lastMessage.sentAt)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    {/* Role chip */}
                    <Chip
                      label={conversation.participantRole.replace('_', ' ')}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 600,
                        mb: 0.5,
                        bgcolor: alpha(
                          conversation.participantRole === "EVALUATOR"
                            ? colors?.primary?.main || "#6A0000"
                            : colors?.accent?.info || "#0066CC",
                          0.1
                        ),
                        color:
                          conversation.participantRole === "EVALUATOR"
                            ? colors?.primary?.main || "#6A0000"
                            : colors?.accent?.info || "#0066CC",
                      }}
                    />
                    
                    {/* Last message preview */}
                    <Typography
                      variant="body2"
                      color={colors?.neutral?.[600] || "#666"}
                      sx={{
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                      }}
                    >
                      <strong>{subject}:</strong> {truncateMessage(body, 60)}
                    </Typography>
                    
                    {/* Message count */}
                    <Typography
                      variant="caption"
                      color={colors?.neutral?.[500] || "#888"}
                      sx={{ fontSize: 11, mt: 0.25 }}
                    >
                      {conversation.messageCount} {conversation.messageCount === 1 ? 'message' : 'messages'}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        )
      })}
    </List>
  )
}

ConversationListView.propTypes = {
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      participantId: PropTypes.number,
      participantName: PropTypes.string,
      participantRole: PropTypes.string,
      lastMessage: PropTypes.string,
      lastMessageTimestamp: PropTypes.string,
      unreadCount: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
  onSelectConversation: PropTypes.func,
  selectedParticipantId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  colors: PropTypes.shape({
    primary: PropTypes.shape({
      main: PropTypes.string,
      dark: PropTypes.string,
    }),
    secondary: PropTypes.shape({
      main: PropTypes.string,
    }),
    accent: PropTypes.shape({
      info: PropTypes.string,
    }),
    neutral: PropTypes.objectOf(PropTypes.string),
  }),
  currentUserType: PropTypes.string,
}

export default ConversationListView
