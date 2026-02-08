import React, { useMemo } from "react"
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material"
import { 
  Send as SendIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material"

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
}) => {
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

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
        {conversationLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} sx={{ color: safeColors.primary.main }} />
          </Box>
        ) : conversationMessages.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color={safeColors.neutral[500]}>
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <>
            {uniqueMessages.map((msg, idx) => {
              const isFromCurrentUser = msg.senderType === currentUserType
              return (
                <Box
                  key={msg.messageId || idx}
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
              )
            })}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${safeColors.neutral[200]}`,
          bgcolor: "white",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sendingMessage}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: safeColors.neutral[50],
                fontSize: 14,
                "& fieldset": {
                  borderColor: safeColors.neutral[200],
                },
                "&:hover fieldset": {
                  borderColor: safeColors.neutral[300],
                },
                "&.Mui-focused fieldset": {
                  borderColor: safeColors.primary.main,
                },
              },
            }}
          />
          <IconButton
            onClick={onSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
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

export default ConversationView
