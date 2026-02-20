import React, { useState, useMemo } from "react"
import PropTypes from 'prop-types'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Avatar,
  alpha,
  TextField,
  InputAdornment,
} from "@mui/material"
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Inbox as InboxIcon,
  Mail as MailIcon,
  SupervisorAccount as EvaluatorIcon,
  AdminPanelSettings as AdminIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material"
import ConversationView from "./ConversationView"
import ChatListItem from "./ChatListItem"

// Helper functions moved outside component for stability
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

const ChatDrawer = ({
  open,
  onClose,
  chatList,
  allEvaluators = [], // New prop for all evaluators
  allApplicants = [], // New prop for all applicants
  allProgramAdmins = [], // New prop for all program admins
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
  onRefreshChatList, // New prop for manual refresh
}) => {
  // Ensure colors object has all required properties with defaults
  const safeColors = {
    primary: { main: colors?.primary?.main || "#6A0000", dark: colors?.primary?.dark || "#450000" },
    secondary: { main: colors?.secondary?.main || "#FFC72C", light: colors?.secondary?.light || "#FFD54F" },
    accent: { info: colors?.accent?.info || "#0288d1" },
    neutral: {
      50: colors?.neutral?.[50] || "#fafafa",
      100: colors?.neutral?.[100] || "#f5f5f5",
      200: colors?.neutral?.[200] || "#e0e0e0",
      300: colors?.neutral?.[300] || "#d0d0d0",
      400: colors?.neutral?.[400] || "#999",
      500: colors?.neutral?.[500] || "#888",
      600: colors?.neutral?.[600] || "#666",
      800: colors?.neutral?.[800] || "#222",
    },
  }

  // Search state
  const [searchTerm, setSearchTerm] = useState("")

  // For PROGRAM_ADMIN: merge chat list with all evaluators for search, but filter to only show those with messages
  // For EVALUATOR: merge chat list with all program admins for search, but filter to only show those with messages
  const mergedChatList = useMemo(() => {
    if (currentUserType === "PROGRAM_ADMIN") {
      // Create sets of IDs that already have conversations
      const existingEvaluatorIds = new Set(
        chatList
          .filter(chat => chat.participantRole === "EVALUATOR")
          .map(chat => chat.participantId)
      )
      const existingApplicantIds = new Set(
        chatList
          .filter(chat => chat.participantRole === "APPLICANT")
          .map(chat => chat.participantId)
      )

      // Add evaluators without existing conversations (for search purposes)
      const evaluatorsWithoutChat = allEvaluators
        .filter(evaluator => !existingEvaluatorIds.has(evaluator.evaluatorId))
        .map(evaluator => ({
          participantId: evaluator.evaluatorId,
          participantName: evaluator.name,
          participantRole: "EVALUATOR",
          lastMessageContent: null,
          lastMessageTimestamp: null,
          unread: false,
          isNew: true, // Flag to indicate this is a new conversation
        }))

      // Add applicants without existing conversations (for search purposes)
      const applicantsWithoutChat = allApplicants
        .filter(applicant => !existingApplicantIds.has(applicant.applicantId))
        .map(applicant => ({
          participantId: applicant.applicantId,
          participantName: applicant.name,
          participantRole: "APPLICANT",
          lastMessageContent: null,
          lastMessageTimestamp: null,
          unread: false,
          isNew: true, // Flag to indicate this is a new conversation
        }))

      // Merge for search, but will filter out isNew items unless searching
      return [...chatList, ...evaluatorsWithoutChat, ...applicantsWithoutChat]
    } else if (currentUserType === "EVALUATOR") {
      // Create set of admin IDs that already have conversations
      const existingAdminIds = new Set(
        chatList
          .filter(chat => chat.participantRole === "PROGRAM_ADMIN")
          .map(chat => chat.participantId)
      )

      // Add program admins without existing conversations (for search purposes)
      const adminsWithoutChat = allProgramAdmins
        .filter(admin => !existingAdminIds.has(admin.adminId))
        .map(admin => ({
          participantId: admin.adminId,
          participantName: admin.name,
          participantRole: "PROGRAM_ADMIN",
          lastMessageContent: null,
          lastMessageTimestamp: null,
          unread: false,
          isNew: true, // Flag to indicate this is a new conversation
        }))

      // Merge for search, but will filter out isNew items unless searching
      return [...chatList, ...adminsWithoutChat]
    }
    
    return chatList
  }, [chatList, allEvaluators, allApplicants, allProgramAdmins, currentUserType])

  // Filter chat list based on search term and show only conversations with messages when not searching
  const filteredChatList = useMemo(() => {
    // If searching, show all matches including new conversations
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      return mergedChatList.filter(chat => 
        chat.participantName?.toLowerCase().includes(searchLower) ||
        getRoleDisplayName(chat.participantRole)?.toLowerCase().includes(searchLower)
      )
    }
    
    // If not searching, show conversations with messages OR assigned applicants
    // But filter out isNew items (like program admins for evaluators, or evaluators/applicants for program admins when not searching)
    return mergedChatList.filter(chat => !chat.isNew || chat.isAssigned)
  }, [mergedChatList, searchTerm])

  // Clear search when drawer closes or conversation is selected
  React.useEffect(() => {
    if (!open || selectedConversation) {
      setSearchTerm("")
    }
  }, [open, selectedConversation])

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 420 },
            maxWidth: "100%",
          },
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: safeColors.neutral[50],
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${safeColors.neutral[200]}`,
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          {selectedConversation ? (
            <>
              <IconButton size="small" onClick={onCloseConversation} sx={{ color: safeColors.neutral[600] }}>
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
                          ? alpha(safeColors.primary.main, 0.1)
                          : alpha(safeColors.accent.info, 0.1),
                      color:
                        selectedConversation.participantRole === "EVALUATOR"
                          ? safeColors.primary.main
                          : safeColors.accent.info,
                    }}
                  >
                    <RoleIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                )
              })()}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} color={safeColors.neutral[800]}>
                  {selectedConversation.participantName}
                </Typography>
                <Typography variant="caption" color={safeColors.neutral[500]} sx={{ fontSize: 11 }}>
                  {getRoleDisplayName(selectedConversation.participantRole)}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <InboxIcon sx={{ color: safeColors.primary.main }} />
              <Typography variant="subtitle1" fontWeight={700} color={safeColors.neutral[800]}>
                Messages
              </Typography>
              <Box sx={{ flex: 1 }} />
              {onRefreshChatList && (
                <IconButton
                  size="small"
                  onClick={onRefreshChatList}
                  disabled={loading}
                  sx={{ 
                    color: safeColors.neutral[600],
                    '&:hover': { color: safeColors.primary.main }
                  }}
                  title="Refresh messages"
                >
                  <RefreshIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
            </>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: safeColors.neutral[500] }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Search Bar (only show when no conversation is selected) */}
        {!selectedConversation && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${safeColors.neutral[200]}`,
              bgcolor: "white",
              flexShrink: 0,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 20, color: safeColors.neutral[400] }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                        sx={{ padding: 0.5 }}
                      >
                      <ClearIcon sx={{ fontSize: 18, color: safeColors.neutral[400] }} />
                    </IconButton>
                  </InputAdornment>
                  ),
                  sx: {
                    fontSize: 14,
                    bgcolor: safeColors.neutral[50],
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: safeColors.neutral[200],
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: safeColors.neutral[300],
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: safeColors.primary.main,
                    },
                  },
                },
              }}
            />
          </Box>
        )}

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
            colors={safeColors}
            currentUserType={currentUserType}
            lastSeen={selectedConversation.lastMessageTimestamp ? 
              new Date(selectedConversation.lastMessageTimestamp).toLocaleString([], { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : null
            }
          />
        ) : (
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {(() => {
              if (loading) {
                return (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={32} sx={{ color: safeColors.primary.main }} />
                  </Box>
                );
              }
              
              if (filteredChatList.length === 0) {
                return (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <MailIcon sx={{ fontSize: 48, color: safeColors.neutral[300], mb: 2 }} />
                    <Typography variant="body2" color={safeColors.neutral[500]}>
                      {searchTerm ? "No conversations match your search" : "No conversations yet"}
                    </Typography>
                    {searchTerm && (
                      <Typography variant="caption" color={safeColors.neutral[400]} sx={{ mt: 1, display: "block" }}>
                        Try searching for a different name or role
                      </Typography>
                    )}
                  </Box>
                );
              }
              
              return filteredChatList.map((chat, idx) => (
                <ChatListItem
                  key={`${chat.participantRole}-${chat.participantId || idx}`}
                  chat={chat}
                  onClick={() => onSelectConversation(chat)}
                  getRoleIcon={getRoleIcon}
                  getRoleDisplayName={getRoleDisplayName}
                  formatMessageTime={formatMessageTime}
                  colors={safeColors}
                />
              ));
            })()}
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

ChatDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  chatList: PropTypes.arrayOf(PropTypes.object).isRequired,
  allEvaluators: PropTypes.arrayOf(PropTypes.object),
  allApplicants: PropTypes.arrayOf(PropTypes.object),
  allProgramAdmins: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool.isRequired,
  selectedConversation: PropTypes.shape({
    participantRole: PropTypes.string,
    participantName: PropTypes.string,
    lastMessageTimestamp: PropTypes.string,
  }),
  onSelectConversation: PropTypes.func.isRequired,
  onCloseConversation: PropTypes.func.isRequired,
  conversationMessages: PropTypes.arrayOf(PropTypes.object).isRequired,
  conversationLoading: PropTypes.bool.isRequired,
  newMessage: PropTypes.string.isRequired,
  onMessageChange: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  sendingMessage: PropTypes.bool.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
  formatMessageTime: PropTypes.func.isRequired,
  colors: PropTypes.shape({
    primary: PropTypes.shape({
      main: PropTypes.string,
      dark: PropTypes.string,
    }),
    secondary: PropTypes.shape({
      main: PropTypes.string,
      light: PropTypes.string,
    }),
    accent: PropTypes.shape({
      info: PropTypes.string,
    }),
    neutral: PropTypes.object,
  }).isRequired,
  currentUserType: PropTypes.string,
  onRefreshChatList: PropTypes.func,
};

export default ChatDrawer
