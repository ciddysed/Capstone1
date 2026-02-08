import React from "react"
import {
  Box,
  Typography,
  Avatar,
  alpha,
} from "@mui/material"
import { Circle as UnreadIcon } from "@mui/icons-material"

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

  const RoleIcon = getRoleIcon(chat.participantRole)
  const isUnread = chat.unread

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderBottom: `1px solid ${colors.neutral[200]}`,
        cursor: "pointer",
        bgcolor: isUnread ? alpha(colors.secondary.light, 0.08) : "transparent",
        transition: "background-color 0.15s ease",
        "&:hover": {
          bgcolor: isUnread ? alpha(colors.secondary.light, 0.12) : colors.neutral[100],
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        {/* Avatar with role icon */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor:
              chat.participantRole === "EVALUATOR"
                ? alpha(colors.primary.main, 0.1)
                : chat.participantRole === "PROGRAM_ADMIN"
                ? alpha(colors.secondary.main, 0.1)
                : alpha(colors.accent.info, 0.1),
            color:
              chat.participantRole === "EVALUATOR"
                ? colors.primary.main
                : chat.participantRole === "PROGRAM_ADMIN"
                ? colors.secondary.main
                : colors.accent.info,
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
                color={colors.neutral[800]}
                noWrap
              >
                {chat.participantName || "Unknown"}
              </Typography>
              {isUnread && (
                <UnreadIcon
                  sx={{
                    fontSize: 8,
                    color: colors.primary.main,
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              color={colors.neutral[400]}
              sx={{ flexShrink: 0, fontSize: 11 }}
            >
              {formatMessageTime(chat.lastMessageTimestamp)}
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
              bgcolor:
                chat.participantRole === "EVALUATOR"
                  ? alpha(colors.primary.main, 0.08)
                  : chat.participantRole === "PROGRAM_ADMIN"
                  ? alpha(colors.secondary.main, 0.08)
                  : alpha(colors.accent.info, 0.08),
              color:
                chat.participantRole === "EVALUATOR"
                  ? colors.primary.main
                  : chat.participantRole === "PROGRAM_ADMIN"
                  ? colors.secondary.main
                  : colors.accent.info,
            }}
          >
            {getRoleDisplayName(chat.participantRole)}
          </Typography>
          {/* Last message preview */}
          <Typography
            variant="body2"
            color={colors.neutral[600]}
            sx={{
              fontSize: 13,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontWeight: isUnread ? 500 : 400,
            }}
          >
            {parseMessageContent(chat.lastMessageContent)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ChatListItem
