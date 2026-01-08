import React, { useEffect, useState, useCallback } from "react";
import AcceptanceStatusPoller from './AcceptanceStatusPoller';
import { Typography, Box } from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Usage: <DashboardLink />
// Always visible. Disabled/locked if not accepted, enabled if accepted.
const DashboardLink = () => {
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  const applicantId = localStorage.getItem("applicantId");
  // Polling logic for acceptance status
  const fetchAcceptanceStatus = useCallback(async (id) => {
    if (!id) {
      setAccepted(false);
      setChecked(true);
      return;
    }
    try {
      const res = await fetch(`https://eteeap-foth.onrender.com/api/accepted-applicants/applicant/${id}`);
      const data = res.ok ? await res.json() : null;
      if (data && (data._id || data.status === 'ACCEPTED')) {
        setAccepted(true);
        localStorage.setItem("isAccepted", "true");
      } else {
        setAccepted(false);
        localStorage.setItem("isAccepted", "false");
      }
      setChecked(true);
    } catch (err) {
      setAccepted(false);
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    fetchAcceptanceStatus(applicantId);
  }, [applicantId, fetchAcceptanceStatus]);


  // Polling component for real-time status
  // Only render if applicantId exists
  // Must be inside the render body
  const poller = applicantId ? <AcceptanceStatusPoller applicantId={applicantId} fetchAcceptanceStatus={fetchAcceptanceStatus} /> : null;


  if (!checked) return poller;

  return (
    <>
      {poller}
      <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
        {accepted ? (
          <Typography
            component="a"
            href="#"
            onClick={e => {
              e.preventDefault();
              navigate("/accepted-dashboard");
            }}
            sx={{
              color: "#FFD700",
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
              mx: 1,
              fontSize: 16
            }}
          >
            Dashboard
          </Typography>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", opacity: 0.7, mx: 1 }}>
            <LockIcon sx={{ fontSize: 18, mr: 0.5, color: "#FFD700" }} />
            <Typography
              sx={{
                color: "#FFD700",
                fontWeight: 600,
                fontSize: 16,
                textDecoration: "none",
                cursor: "not-allowed",
              }}
              title="You are not accepted yet, that's why you can't go to the dashboard."
            >
              Dashboard
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default DashboardLink;
