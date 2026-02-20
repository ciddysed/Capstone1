import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Skeleton,
  Fade,
  Grow,
  Tooltip,
} from "@mui/material"
import { 
  Send as SendIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"

const CHARACTER_LIMIT = 500

const ConversationView = ({
  conversationMessages,
  conversationLoading,
  newMessage,
  onMessageChange,
  onSendMessage,
  sendingMessage,
  messagesEndRef,
  formatMessageTime,
  colors,
  currentUserType = "APPLICANT", // Default to APPLICANT for backward compatibility
  lastSeen, // Optional: last seen timestamp
}) => {
  const [showSentConfirmation, setShowSentConfirmation] = useState(false)
  // Ensure colors object has all required properties with defaults
  const safeColors = {
    primary: { main: colors?.primary?.main || "#6A0000", dark: colors?.primary?.dark || "#450000" },
    secondary: { main: colors?.secondary?.main || "#FFC72C" },
    neutral: {
      50: colors?.neutral?.[50] || "#fafafa",
      200: colors?.neutral?.[200] || "#e0e0e0",
      300: colors?.neutral?.[300] || "#d0d0d0",
      400: colors?.neutral?.[400] || "#999",
      500: colors?.neutral?.[500] || "#888",
      800: colors?.neutral?.[800] || "#222",
    },
  }

  // Parse message content (handles both JSON and plain text)
  const parseMessageContent = (content) => {
    if (!content) return ""
    try {
      const parsed = JSON.parse(content)
      return parsed.body || content
    } catch {
      return content
    }
  }

  // Deduplicate messages at render time to prevent React key warnings
  const uniqueMessages = useMemo(() => {
    const seen = new Map();
    return conversationMessages.filter(msg => {
      if (seen.has(msg.messageId)) {
        return false;
      }
      seen.set(msg.messageId, true);
      return true;
    });
  }, [conversationMessages]);

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to send
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSendWithAnimation()
    }
    // Shift+Enter for new line (default behavior)
    // Plain Enter for new line
  }

  const handleSendWithAnimation = async () => {
    if (!newMessage.trim() || sendingMessage) return
    await onSendMessage()
    // Show confirmation animation
    setShowSentConfirmation(true)
    setTimeout(() => setShowSentConfirmation(false), 2000)
  }

  // Character count validation
  const characterCount = newMessage.length
  const isOverLimit = characterCount > CHARACTER_LIMIT
  const showCharCount = characterCount > CHARACTER_LIMIT * 0.8 // Show at 80%

  const getStatusIcon = (message) => {
    const isFromCurrentUser = message.senderType === currentUserType
    if (!isFromCurrentUser) return null
    
    const status = message.status || "SENT"
    
    if (status === "SEEN") {
      return <DoneAllIcon sx={{ fontSize: 12, ml: 0.5, color: safeColors.secondary.main }} />
    } else if (status === "DELIVERED") {
      return <DoneAllIcon sx={{ fontSize: 12, ml: 0.5 }} />
    } else {
      return <DoneIcon sx={{ fontSize: 12, ml: 0.5 }} />
    }
  }

  const renderMessageContent = () => {
    if (conversationLoading) {
      return (
        <>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-end" : "flex-start", mb: 1.5 }}>
              <Box sx={{ maxWidth: "70%" }}>
                <Skeleton variant="rounded" height={60} width={i === 2 ? 250 : 180} animation="wave" />
              </Box>
            </Box>
          ))}
        </>
      )
    }

    if (conversationMessages.length === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color={safeColors.neutral[500]}>
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      )
    }

    return (
      <>
        {uniqueMessages.map((msg, idx) => {
          const isFromCurrentUser = msg.senderType === currentUserType
          const fullTimestamp = msg.sentAt ? new Date(msg.sentAt).toLocaleString() : ""
          return (
            <Tooltip 
              key={msg.messageId || idx}
              title={fullTimestamp || "Sending..."}
              placement={isFromCurrentUser ? "left" : "right"}
              arrow
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: isFromCurrentUser ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    maxWidth: "80%",
                    p: 1.5,
                    borderRadius: 2,
                  bgcolor: isFromCurrentUser ? safeColors.primary.main : "white",
                  color: isFromCurrentUser ? "white" : safeColors.neutral[800],
                  border: isFromCurrentUser ? "none" : `1px solid ${safeColors.neutral[200]}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {parseMessageContent(msg.content)}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mt: 0.75 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 10,
                      opacity: isFromCurrentUser ? 0.8 : 0.6,
                    }}
                  >
                    {formatMessageTime(msg.sentAt || msg.createdAt)}
                  </Typography>
                  {getStatusIcon(msg)}
                </Box>
              </Box>
            </Box>
          </Tooltip>
          )
        })}
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </>
    )
  }

  return (
    <>
      {/* Conversation Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {renderMessageContent()}
      </Box>

      {/* Message sent confirmation */}
      <Grow in={showSentConfirmation}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "rgba(76, 175, 80, 0.95)",
            color: "white",
            px: 3,
            py: 1.5,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600}>Message sent!</Typography>
        </Box>
      </Grow>

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${safeColors.neutral[200]}`,
          bgcolor: "white",
          flexShrink: 0,
        }}
      >
        {/* Last seen indicator */}
        {lastSeen && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontSize: 11 }}>
            Last seen: {lastSeen}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
          <Box sx={{ flex: 1, position: "relative" }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type your message... (Ctrl+Enter to send)"
              value={newMessage}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= CHARACTER_LIMIT) {
                  onMessageChange(value)
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={sendingMessage}
              size="small"
              error={isOverLimit}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: safeColors.neutral[50],
                  fontSize: 14,
                  "& fieldset": {
                    borderColor: isOverLimit ? "error.main" : safeColors.neutral[200],
                  },
                  "&:hover fieldset": {
                    borderColor: isOverLimit ? "error.main" : safeColors.neutral[300],
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isOverLimit ? "error.main" : safeColors.primary.main,
                  },
                },
              }}
            />
            {/* Character counter */}
            {showCharCount && (
              <Fade in={showCharCount}>
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 12,
                    fontSize: 10,
                    color: isOverLimit ? "error.main" : "text.secondary",
                    bgcolor: "white",
                    px: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {characterCount}/{CHARACTER_LIMIT}
                </Typography>
              </Fade>
            )}
          </Box>
          <IconButton
            onClick={handleSendWithAnimation}
            disabled={!newMessage.trim() || sendingMessage || isOverLimit}
            sx={{
              bgcolor: safeColors.primary.main,
              color: "white",
              width: 40,
              height: 40,
              "&:hover": {
                bgcolor: safeColors.primary.dark,
              },
              "&.Mui-disabled": {
                bgcolor: safeColors.neutral[200],
                color: safeColors.neutral[400],
              },
            }}
          >
            {sendingMessage ? (
              <CircularProgress size={18} sx={{ color: "inherit" }} />
            ) : (
              <SendIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Box>
      </Box>
    </>
  )
}

ConversationView.propTypes = {
  conversationMessages: PropTypes.arrayOf(
    PropTypes.shape({
      messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      content: PropTypes.string,
      senderType: PropTypes.string,
      sentAt: PropTypes.string,
      createdAt: PropTypes.string,
      status: PropTypes.string,
    })
  ).isRequired,
  conversationLoading: PropTypes.bool.isRequired,
  newMessage: PropTypes.string.isRequired,
  onMessageChange: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  sendingMessage: PropTypes.bool.isRequired,
  messagesEndRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
  formatMessageTime: PropTypes.func.isRequired,
  colors: PropTypes.shape({
    primary: PropTypes.shape({
      main: PropTypes.string,
      dark: PropTypes.string,
    }),
    secondary: PropTypes.shape({
      main: PropTypes.string,
    }),
    neutral: PropTypes.shape({
      50: PropTypes.string,
      200: PropTypes.string,
      300: PropTypes.string,
      400: PropTypes.string,
      500: PropTypes.string,
      800: PropTypes.string,
    }),
  }).isRequired,
  currentUserType: PropTypes.string,
  lastSeen: PropTypes.string,
}

export default ConversationView
