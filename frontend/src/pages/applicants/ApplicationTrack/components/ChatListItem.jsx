import React from "react"
import PropTypes from 'prop-types'
import {
  Box,
  Typography,
  Avatar,
  alpha,
} from "@mui/material"
import { Circle as UnreadIcon } from "@mui/icons-material"

// Helper functions to avoid nested ternaries
const getAvatarBackgroundColor = (role, colors) => {
  if (role === "EVALUATOR") return alpha(colors.primary.main, 0.1);
  if (role === "PROGRAM_ADMIN") return alpha(colors.secondary.main, 0.1);
  return alpha(colors.accent.info, 0.1);
};

const getRoleColor = (role, colors) => {
  if (role === "EVALUATOR") return colors.primary.main;
  if (role === "PROGRAM_ADMIN") return colors.secondary.main;
  return colors.accent.info;
};

const getRoleBadgeBackgroundColor = (role, colors) => {
  if (role === "EVALUATOR") return alpha(colors.primary.main, 0.08);
  if (role === "PROGRAM_ADMIN") return alpha(colors.secondary.main, 0.08);
  return alpha(colors.accent.info, 0.08);
};

const getMessagePreviewContent = (chat, parseMessageContent) => {
  if (chat.isAssigned) return "Assigned applicant - start conversation";
  if (chat.isNew) return "Start a new conversation";
  return parseMessageContent(chat.lastMessageContent);
};

const ChatListItem = ({
  chat,
  onClick,
  getRoleIcon,
  getRoleDisplayName,
  formatMessageTime,
  colors,
}) => {
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

  // Ensure colors object has all required properties with defaults
  const safeColors = {
    primary: { main: colors?.primary?.main || "#6A0000" },
    secondary: { main: colors?.secondary?.main || "#FFC72C", light: colors?.secondary?.light || "#FFD54F" },
    accent: { info: colors?.accent?.info || "#0288d1" },
    neutral: {
      100: colors?.neutral?.[100] || "#f5f5f5",
      200: colors?.neutral?.[200] || "#e0e0e0",
      400: colors?.neutral?.[400] || "#999",
      600: colors?.neutral?.[600] || "#666",
      800: colors?.neutral?.[800] || "#222",
    },
  }

  const RoleIcon = getRoleIcon(chat.participantRole)
  const isUnread = chat.unread

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderBottom: `1px solid ${safeColors.neutral[200]}`,
        cursor: "pointer",
        bgcolor: isUnread ? alpha(safeColors.secondary.light, 0.08) : "transparent",
        transition: "background-color 0.15s ease",
        "&:hover": {
          bgcolor: isUnread ? alpha(safeColors.secondary.light, 0.12) : safeColors.neutral[100],
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        {/* Avatar with role icon */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: getAvatarBackgroundColor(chat.participantRole, safeColors),
            color: getRoleColor(chat.participantRole, safeColors),
            flexShrink: 0,
          }}
        >
          <RoleIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0.25,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="subtitle2"
                fontWeight={isUnread ? 700 : 600}
                color={safeColors.neutral[800]}
                noWrap
              >
                {chat.participantName || "Unknown"}
              </Typography>
              {isUnread && (
                <UnreadIcon
                  sx={{
                    fontSize: 8,
                    color: safeColors.primary.main,
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              color={safeColors.neutral[400]}
              sx={{ flexShrink: 0, fontSize: 11 }}
            >
              {chat.isNew || chat.isAssigned ? "" : formatMessageTime(chat.lastMessageTimestamp)}
            </Typography>
          </Box>
          {/* Role badge */}
          <Typography
            variant="caption"
            sx={{
              display: "inline-block",
              px: 1,
              py: 0.25,
              mb: 0.5,
              borderRadius: 1,
              fontSize: 10,
              fontWeight: 600,
              bgcolor: getRoleBadgeBackgroundColor(chat.participantRole, safeColors),
              color: getRoleColor(chat.participantRole, safeColors),
            }}
          >
            {getRoleDisplayName(chat.participantRole)}
          </Typography>
          {/* Last message preview */}
          <Typography
            variant="body2"
            color={chat.isNew || chat.isAssigned ? safeColors.neutral[400] : safeColors.neutral[600]}
            sx={{
              fontSize: 13,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontWeight: isUnread ? 500 : 400,
              fontStyle: chat.isNew || chat.isAssigned ? "italic" : "normal",
            }}
          >
            {getMessagePreviewContent(chat, parseMessageContent)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

ChatListItem.propTypes = {
  chat: PropTypes.shape({
    participantRole: PropTypes.string.isRequired,
    participantName: PropTypes.string,
    unread: PropTypes.bool,
    isNew: PropTypes.bool,
    isAssigned: PropTypes.bool,
    lastMessageTimestamp: PropTypes.string,
    lastMessageContent: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  getRoleIcon: PropTypes.func.isRequired,
  getRoleDisplayName: PropTypes.func.isRequired,
  formatMessageTime: PropTypes.func.isRequired,
  colors: PropTypes.shape({
    primary: PropTypes.shape({
      main: PropTypes.string,
    }),
    secondary: PropTypes.shape({
      main: PropTypes.string,
      light: PropTypes.string,
    }),
    accent: PropTypes.shape({
      info: PropTypes.string,
    }),
    neutral: PropTypes.shape({
      100: PropTypes.string,
      200: PropTypes.string,
      400: PropTypes.string,
      600: PropTypes.string,
      800: PropTypes.string,
    }),
  }).isRequired,
};

export default ChatListItem
