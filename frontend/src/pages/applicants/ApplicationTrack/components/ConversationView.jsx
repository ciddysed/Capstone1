import React from "react"
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material"
import { Send as SendIcon } from "@mui/icons-material"

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
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
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
            <CircularProgress size={32} sx={{ color: colors.primary.main }} />
          </Box>
        ) : conversationMessages.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color={colors.neutral[500]}>
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <>
            {conversationMessages.map((msg, idx) => {
              const isFromApplicant = msg.senderType === "APPLICANT"
              return (
                <Box
                  key={msg.messageId || idx}
                  sx={{
                    display: "flex",
                    justifyContent: isFromApplicant ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "80%",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isFromApplicant ? colors.primary.main : "white",
                      color: isFromApplicant ? "white" : colors.neutral[800],
                      border: isFromApplicant ? "none" : `1px solid ${colors.neutral[200]}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.5 }}>
                      {msg.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.75,
                        fontSize: 10,
                        opacity: isFromApplicant ? 0.8 : 0.6,
                        textAlign: "right",
                      }}
                    >
                      {formatMessageTime(msg.sentAt || msg.createdAt)}
                    </Typography>
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
          borderTop: `1px solid ${colors.neutral[200]}`,
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
                bgcolor: colors.neutral[50],
                fontSize: 14,
                "& fieldset": {
                  borderColor: colors.neutral[200],
                },
                "&:hover fieldset": {
                  borderColor: colors.neutral[300],
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.primary.main,
                },
              },
            }}
          />
          <IconButton
            onClick={onSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            sx={{
              bgcolor: colors.primary.main,
              color: "white",
              width: 40,
              height: 40,
              "&:hover": {
                bgcolor: colors.primary.dark,
              },
              "&.Mui-disabled": {
                bgcolor: colors.neutral[200],
                color: colors.neutral[400],
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
