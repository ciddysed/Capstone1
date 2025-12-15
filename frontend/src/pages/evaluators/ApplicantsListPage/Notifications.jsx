import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
  Button,
  ListItemButton,
  Link,
  Stack,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import EvaluatorNavigation from "../../../components/Navigation/EvaluatorNavigation";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const evaluatorId = localStorage.getItem("evaluatorId");
  const navigate = useNavigate();

  // Log evaluatorId for debugging
  useEffect(() => {
    console.log("Evaluator ID used for notifications:", evaluatorId);
  }, [evaluatorId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://eteeap-foth.onrender.com/api/evaluations/notifications/evaluator/${evaluatorId}`
      );
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setNotifications([]);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `https://eteeap-foth.onrender.com/api/evaluations/notifications/${notificationId}/mark-as-read`,
        { method: "PUT" }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, read: true } : n
        )
      );
    } catch {
      // ignore error for now
    }
  };

  // Handler to go to applicant view page
  const handleNotificationClick = (notif) => {
    if (notif.applicantId) {
      navigate("/evaluator/applicants/view-applicant", {
        state: {
          applicantId: notif.applicantId,
          evaluationId: notif.evaluationId,
          courseId: notif.courseId,
        },
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const notificationsContent = (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            Notifications
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No notifications found.
          </Typography>
        ) : (
          <List>
            {notifications.map((notif) => {
              const clickable = Boolean(notif.applicantId);
              const ContentComponent = clickable ? ListItemButton : ListItem;
              return (
                <ContentComponent
                  key={notif.notificationId}
                  onClick={
                    clickable
                      ? () => handleNotificationClick(notif)
                      : undefined
                  }
                  sx={{
                    bgcolor: notif.read ? "grey.100" : "yellow.50",
                    mb: 1,
                    borderRadius: 1,
                    cursor: clickable ? "pointer" : "default",
                    "&:hover": clickable
                      ? { bgcolor: notif.read ? "grey.200" : "yellow.100" }
                      : {},
                    transition: "background-color 0.2s",
                  }}
                  disableGutters
                >
                  <ListItemText
                    primary={
                      clickable ? (
                        <Link
                          component="button"
                          underline="hover"
                          color="primary"
                          sx={{ fontWeight: 600, fontSize: "1rem" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notif);
                          }}
                        >
                          {notif.message || "Notification"}
                        </Link>
                      ) : (
                        notif.message || "Notification"
                      )
                    }
                    secondary={
                      notif.createdAt
                        ? new Date(notif.createdAt).toLocaleString()
                        : ""
                    }
                  />
                  {!notif.read && (
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        {clickable && (
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notif);
                            }}
                          >
                            View
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.notificationId);
                          }}
                        >
                          Mark as read
                        </Button>
                      </Stack>
                    </ListItemSecondaryAction>
                  )}
                  {notif.read && (
                    <Chip
                      label="Read"
                      size="small"
                      color="success"
                      sx={{ ml: 2 }}
                    />
                  )}
                </ContentComponent>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );

  return <EvaluatorNavigation>{notificationsContent}</EvaluatorNavigation>;
};

export default Notifications;
