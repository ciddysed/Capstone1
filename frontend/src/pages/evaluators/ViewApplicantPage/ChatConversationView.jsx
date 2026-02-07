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
  Refresh as RefreshIcon,
} from "@mui/icons-material"

const ChatConversationView = ({
  conversationMessages,
  conversationLoading,
  newMessage,
  onMessageChange,
  onSendMessage,
  sendingMessage,
  messagesEndRef,
  formatMessageTime,
  colors,
  currentUserType = "EVALUATOR",
  onRefresh, // New prop for manual refresh
}) => {
  // Deduplicate messages at render time to prevent React key warnings
  const uniqueMessages = useMemo(() => {
    const seen = new Map();
    return (conversationMessages || []).filter(msg => {
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

  const formatTime = (timestamp) => {
    if (formatMessageTime) return formatMessageTime(timestamp);
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const getStatusIcon = (message) => {
    const isFromCurrentUser = message.senderType === currentUserType
    if (!isFromCurrentUser) return null
    
    const status = message.status || "SENT"
    
    if (status === "SEEN") {
      return <DoneAllIcon sx={{ fontSize: 12, ml: 0.5, color: colors.secondary?.main || '#FFC72C' }} />
    } else if (status === "DELIVERED") {
      return <DoneAllIcon sx={{ fontSize: 12, ml: 0.5 }} />
    } else {
      return <DoneIcon sx={{ fontSize: 12, ml: 0.5 }} />
    }
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 400, 
      border: `1px solid ${colors.neutral?.[200] || '#eee'}`,
      borderRadius: 2,
      overflow: 'hidden',
    }}>
      {/* Header with refresh button */}
      {onRefresh && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 1,
          borderBottom: `1px solid ${colors.neutral?.[200] || '#eee'}`,
          bgcolor: 'white',
        }}>
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={conversationLoading}
            sx={{ 
              color: colors.neutral?.[600] || '#666',
              '&:hover': { color: colors.primary?.main || '#6A0000' }
            }}
            title="Refresh messages"
          >
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}
      
      {/* Conversation Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          bgcolor: colors.neutral?.[50] || '#f9f9f9',
        }}
      >
        {conversationLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} sx={{ color: colors.primary?.main || '#6A0000' }} />
          </Box>
        ) : (conversationMessages || []).length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color={colors.neutral?.[500] || '#888'}>
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
                      bgcolor: isFromCurrentUser ? (colors.primary?.main || '#6A0000') : "white",
                      color: isFromCurrentUser ? "white" : (colors.neutral?.[800] || '#222'),
                      border: isFromCurrentUser ? "none" : `1px solid ${colors.neutral?.[200] || '#eee'}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.5 }}>
                      {msg.content}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mt: 0.75 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 10,
                          opacity: isFromCurrentUser ? 0.8 : 0.6,
                        }}
                      >
                        {formatTime(msg.sentAt || msg.createdAt)}
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
          borderTop: `1px solid ${colors.neutral?.[200] || '#eee'}`,
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
            onChange={(e) => onMessageChange(e)}
            onKeyDown={handleKeyDown}
            disabled={sendingMessage}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: colors.neutral?.[50] || '#f9f9f9',
                fontSize: 14,
                "& fieldset": {
                  borderColor: colors.neutral?.[200] || '#eee',
                },
                "&:hover fieldset": {
                  borderColor: colors.neutral?.[300] || '#ddd',
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.primary?.main || '#6A0000',
                },
              },
            }}
          />
          <IconButton
            onClick={onSendMessage}
            disabled={!newMessage?.trim() || sendingMessage}
            sx={{
              bgcolor: colors.primary?.main || '#6A0000',
              color: "white",
              width: 40,
              height: 40,
              "&:hover": {
                bgcolor: colors.primary?.dark || '#450000',
              },
              "&.Mui-disabled": {
                bgcolor: colors.neutral?.[200] || '#eee',
                color: colors.neutral?.[400] || '#aaa',
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
    </Box>
  )
}

export default ChatConversationView
