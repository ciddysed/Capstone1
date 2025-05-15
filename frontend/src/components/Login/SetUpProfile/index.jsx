import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Button,
  Divider,
  InputLabel,
  Snackbar,
  Stack,
  ToggleButtonGroup,
  Typography,
  Alert,
} from "@mui/material";
import { StyledPaper, StyledTextField, StyledToggleButton } from "../LoginForm";
import { useLocation, useNavigate } from "react-router-dom";

// Validation schema
const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  address: yup.string().required("Address is required"),
  contactNumber: yup
    .string()
    .matches(/^09\d{9}$/, "Invalid contact number")
    .required("Contact number is required"),
  birthDate: yup.date().required("Date of birth is required"),
});

const SetUpProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicantId, showCompleteProfileSnackbar } = location.state || {};
  const [gender, setGender] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (showCompleteProfileSnackbar) {
      setSnackbarOpen(true);
    }
  }, [showCompleteProfileSnackbar]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleGenderChange = (event, newGender) => {
    if (newGender !== null) {
      setGender(newGender);
    }
  };

  const onSubmit = async (data) => {
    console.log("applicant ID", applicantId);
    try {
      const date = new Date(data.birthDate);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

      const payload = {
        firstName: data.firstName,
        middleInitial: data.middleInitial || "",
        lastName: data.lastName,
        address: data.address,
        contactNumber: data.contactNumber,
        dateOfBirth: formattedDate,
        gender: gender.toUpperCase(),
        //TODO: Update THe Design, pls double check if there is profiel details input in the
        profileDetails: "Software Engineer",
      };
      console.log("payload", payload);

      await axios.patch(
        `http://localhost:8080/api/applicants/${applicantId}/complete-profile`,
        payload
      );

      navigate("/homepage");
    } catch (error) {
      console.error("Profile setup failed:", error);
    }
  };

  return (
    <StyledPaper elevation={5} sx={{ maxWidth: 900 }}>
      <Typography variant="h5" textAlign="center" fontWeight="bold">
        Complete Your Profile
      </Typography>
      <Typography textAlign="center" fontSize={"12px"}>
        Please provide a few more details before getting started.
      </Typography>
      <Divider sx={{ my: 2 }} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack direction={"row"} gap={2}>
          <StyledTextField
            fullWidth
            placeholder="First Name"
            variant="outlined"
            size="small"
            {...register("firstName")}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <StyledTextField
            fullWidth
            placeholder="Last Name"
            variant="outlined"
            size="small"
            {...register("lastName")}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
          <StyledTextField
            placeholder="M.I."
            variant="outlined"
            size="small"
            {...register("middleInitial")}
          />
        </Stack>

        <Stack direction={"row"} gap={2} mt={2}>
          <StyledTextField
            fullWidth
            placeholder="Address"
            variant="outlined"
            size="small"
            {...register("address")}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
          <StyledTextField
            placeholder="Contact Number (09*********)"
            variant="outlined"
            size="small"
            {...register("contactNumber")}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber?.message}
          />
        </Stack>

        <Stack direction={"row"} justifyContent={"center"} gap={2} mt={2}>
          <Stack gap={1}>
            <InputLabel sx={{ fontSize: "14px" }}>Date of Birth</InputLabel>
            <StyledTextField
              type="date"
              variant="outlined"
              size="small"
              {...register("birthDate")}
              error={!!errors.birthDate}
              helperText={errors.birthDate?.message}
              sx={{ maxWidth: 200 }}
            />
          </Stack>

          <Stack direction="column" justifyContent="center" sx={{ mb: 2 }}>
            <InputLabel sx={{ fontSize: "14px" }}>Gender</InputLabel>
            <ToggleButtonGroup
              value={gender}
              exclusive
              onChange={handleGenderChange}
              aria-label="Gender"
            >
              <StyledToggleButton value="male">Male</StyledToggleButton>
              <StyledToggleButton value="female">Female</StyledToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ backgroundColor: "#800000", borderRadius: "20px", mt: 3 }}
        >
          Save & Continue
        </Button>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setSnackbarOpen(false)}>
          Please complete your profile first
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default SetUpProfile;
