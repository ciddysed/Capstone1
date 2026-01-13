import React from "react"
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Avatar,
  alpha,
} from "@mui/material"
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Inbox as InboxIcon,
  Mail as MailIcon,
  SupervisorAccount as EvaluatorIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material"
import ConversationView from "./ConversationView"
import ChatListItem from "./ChatListItem"

const ChatDrawer = ({
  open,
  onClose,
  chatList,
  loading,
  selectedConversation,
  onSelectConversation,
  onCloseConversation,
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
  const getRoleIcon = (role) => {
    switch (role) {
      case "EVALUATOR":
        return EvaluatorIcon
      case "PROGRAM_ADMIN":
        return AdminIcon
      case "APPLICANT":
        return MailIcon
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

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          maxWidth: "100%",
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: colors.neutral[50],
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${colors.neutral[200]}`,
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          {selectedConversation ? (
            <>
              <IconButton size="small" onClick={onCloseConversation} sx={{ color: colors.neutral[600] }}>
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
              {(() => {
                const RoleIcon = getRoleIcon(selectedConversation.participantRole)
                return (
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor:
                        selectedConversation.participantRole === "EVALUATOR"
                          ? alpha(colors.primary.main, 0.1)
                          : alpha(colors.accent.info, 0.1),
                      color:
                        selectedConversation.participantRole === "EVALUATOR"
                          ? colors.primary.main
                          : colors.accent.info,
                    }}
                  >
                    <RoleIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                )
              })()}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} color={colors.neutral[800]}>
                  {selectedConversation.participantName}
                </Typography>
                <Typography variant="caption" color={colors.neutral[500]} sx={{ fontSize: 11 }}>
                  {getRoleDisplayName(selectedConversation.participantRole)}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <InboxIcon sx={{ color: colors.primary.main }} />
              <Typography variant="subtitle1" fontWeight={700} color={colors.neutral[800]}>
                Messages
              </Typography>
              <Box sx={{ flex: 1 }} />
            </>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: colors.neutral[500] }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Content Area */}
        {selectedConversation ? (
          <ConversationView
            conversationMessages={conversationMessages}
            conversationLoading={conversationLoading}
            newMessage={newMessage}
            onMessageChange={onMessageChange}
            onSendMessage={onSendMessage}
            sendingMessage={sendingMessage}
            messagesEndRef={messagesEndRef}
            formatMessageTime={formatMessageTime}
            colors={colors}
            currentUserType={currentUserType}
          />
        ) : (
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={32} sx={{ color: colors.primary.main }} />
              </Box>
            ) : chatList.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <MailIcon sx={{ fontSize: 48, color: colors.neutral[300], mb: 2 }} />
                <Typography variant="body2" color={colors.neutral[500]}>
                  No conversations yet
                </Typography>
              </Box>
            ) : (
              chatList.map((chat, idx) => (
                <ChatListItem
                  key={`${chat.participantRole}-${chat.participantId || idx}`}
                  chat={chat}
                  onClick={() => onSelectConversation(chat)}
                  getRoleIcon={getRoleIcon}
                  getRoleDisplayName={getRoleDisplayName}
                  formatMessageTime={formatMessageTime}
                  colors={colors}
                />
              ))
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

export default ChatDrawer
