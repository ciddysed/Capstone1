import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Usage: <DashboardLink />
// Always visible. Disabled/locked if not accepted, enabled if accepted.
const DashboardLink = () => {
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const applicantId = localStorage.getItem("applicantId");
    console.log("[DashboardLink] applicantId:", applicantId);
    if (!applicantId) {
      setAccepted(false);
      setChecked(true);
      return;
    }
    // Try localStorage for quick UI
    const acceptedFlag = localStorage.getItem("isAccepted");
    if (acceptedFlag === "true") {
      setAccepted(true);
      setChecked(true);
      return;
    }
    // Fallback: check API
    fetch(`https://eteeap-foth.onrender.com/api/accepted-applicants/applicant/${applicantId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        console.log("[DashboardLink] API response for acceptance:", data);
        // Accept if _id exists or status is 'ACCEPTED'
        if (data && (data._id || data.status === 'ACCEPTED')) {
          setAccepted(true);
          localStorage.setItem("isAccepted", "true");
        } else {
          setAccepted(false);
          localStorage.setItem("isAccepted", "false");
        }
        setChecked(true);
      })
      .catch((err) => {
        console.log("[DashboardLink] API error:", err);
        setAccepted(false);
        setChecked(true);
      });
  }, []);

  if (!checked) return null;

  return (
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
  );
};

export default DashboardLink;
