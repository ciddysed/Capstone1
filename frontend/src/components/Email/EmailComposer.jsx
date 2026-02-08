import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material"
import {
  Close as CloseIcon,
  Send as SendIcon,
  AttachFile as AttachIcon,
} from "@mui/icons-material"

const EmailComposer = ({
  open,
  onClose,
  recipient,
  onSend,
  sending = false,
  colors,
  replyTo = null, // For reply functionality
}) => {
  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject || "(No Subject)"}` : ""
  )
  const [body, setBody] = useState("")
  const [error, setError] = useState("")

  const handleSend = () => {
    if (!subject.trim()) {
      setError("Subject is required")
      return
    }
    if (!body.trim()) {
      setError("Message body is required")
      return
    }

    setError("")
    onSend({ subject: subject.trim(), body: body.trim() })
  }

  const handleClose = () => {
    if (subject.trim() || body.trim()) {
      if (window.confirm("Discard this message?")) {
        setSubject("")
        setBody("")
        setError("")
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${colors?.neutral?.[200] || "#eee"}`,
          pb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {replyTo ? "Reply" : "New Message"}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Recipient */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={600}
              color={colors?.neutral?.[600] || "#666"}
              sx={{ mb: 0.5, display: "block" }}
            >
              To:
            </Typography>
            <Chip
              label={`${recipient?.name || "Unknown"} (${recipient?.role || "User"})`}
              sx={{
                bgcolor: colors?.neutral?.[100] || "#f5f5f5",
                color: colors?.neutral?.[800] || "#333",
                fontWeight: 500,
              }}
            />
          </Box>

          {/* Subject */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={600}
              color={colors?.neutral?.[600] || "#666"}
              sx={{ mb: 0.5, display: "block" }}
            >
              Subject:
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value)
                setError("")
              }}
              variant="outlined"
              size="small"
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "white",
                },
              }}
            />
          </Box>

          {/* Body */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={600}
              color={colors?.neutral?.[600] || "#666"}
              sx={{ mb: 0.5, display: "block" }}
            >
              Message:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              placeholder="Type your message here..."
              value={body}
              onChange={(e) => {
                setBody(e.target.value)
                setError("")
              }}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "white",
                  fontFamily: "inherit",
                },
              }}
            />
          </Box>

          {/* Error Message */}
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: -1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          borderTop: `1px solid ${colors?.neutral?.[200] || "#eee"}`,
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={sending}
          sx={{
            textTransform: "none",
            borderColor: colors?.neutral?.[300] || "#ccc",
            color: colors?.neutral?.[700] || "#555",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim()}
          startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
          sx={{
            textTransform: "none",
            bgcolor: colors?.primary?.main || "#6A0000",
            "&:hover": {
              bgcolor: colors?.primary?.dark || "#4A0000",
            },
          }}
        >
          {sending ? "Sending..." : "Send"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EmailComposer
