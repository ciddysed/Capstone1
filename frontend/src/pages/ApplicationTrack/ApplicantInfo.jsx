import React from "react";
import { Typography, Box } from "@mui/material";
import { InfoSection } from "./styled";

const ApplicantInfo = ({ userData }) => (
  <InfoSection>
    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
      Applicant Information
    </Typography>
    <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Name
        </Typography>
        <Typography variant="body1">{userData.name}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Email
        </Typography>
        <Typography variant="body1">{userData.email}</Typography>
      </Box>
    </Box>
  </InfoSection>
);

export default ApplicantInfo;