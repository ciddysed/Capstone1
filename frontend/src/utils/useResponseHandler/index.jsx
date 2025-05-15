import React, { useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

const useResponseHandler = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const handleSuccess = useCallback((msg) => {
    setMessage(msg);
    setSeverity("success");
    setSnackbarOpen(true);
  }, []);

  const handleError = useCallback((msg) => {
    setMessage(msg);
    setSeverity("error");
    setSnackbarOpen(true);
  }, []);

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  const snackbar = (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );

  return { handleSuccess, handleError, snackbar };
};

export default useResponseHandler;
