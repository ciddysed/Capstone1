import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  AppBar,
  Toolbar,
  Divider,
  List,
  ListItem,
  Button,
  Stack,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import logo from "../../assets/logo.png";
import backgroundImage from "../../assets/login-bg.png";
import dayjs from "dayjs";

const ListLayoutWithFilters = ({ children }) => {
  const [activeButton, setActiveButton] = useState("Dashboard");

  const navItems = ["Applicants", "Logout"];

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Left NavBar */}
      <Box sx={{ width: 240, bgcolor: "#800000", color: "white", p: 2 }}>
        {/* Logo */}
        <Stack
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
            p: 1,
            mb: 2,
            alignItems: "center",
          }}
        >
          <img src={logo} alt="Logo" style={{ height: 100 }} />
        </Stack>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.3)" }} />
        <Stack>
          <List>
            {navItems.map((item) => (
              <ListItem key={item} disablePadding sx={{ my: 1 }}>
                <Button
                  fullWidth
                  onClick={() => setActiveButton(item)}
                  sx={{
                    justifyContent: "flex-start",
                    color: activeButton === item ? "#000" : "#fff",
                    bgcolor: activeButton === item ? "#FFD700" : "transparent",
                    "&:hover": {
                      bgcolor:
                        activeButton === item
                          ? "#FFD700"
                          : "rgba(255,255,255,0.1)",
                    },
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  {item}
                </Button>
              </ListItem>
            ))}
          </List>
        </Stack>
      </Box>

      {/* Right Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          maxHeight: "100vh",
        }}
      >
        {" "}
        <Box sx={{ flexShrink: 0, bgcolor: "transparent", zIndex: 1100 }}>
          {/* Top Bar */}
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar sx={{ justifyContent: "space-between", p: 0 }}>
              <Typography variant="h6" fontWeight="bold">
                Applicants
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                    sx: { borderRadius: 5, bgcolor: "#fff" },
                  }}
                />
                <IconButton>
                  <NotificationsIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Filters */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              flexWrap: "wrap",
              px: 2,
              py: 1,

              position: "sticky",
              top: "64px", // height of AppBar
              zIndex: 1000,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" defaultValue="">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Course</InputLabel>
              <Select label="Course" defaultValue="">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="BSIT">BSIT</MenuItem>
                <MenuItem value="BSA">BSA</MenuItem>
                <MenuItem value="BSBA">BSBA</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select label="Category" defaultValue="">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Internship">Internship</MenuItem>
                <MenuItem value="Scholarship">Scholarship</MenuItem>
                <MenuItem value="Training">Training</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Date Applied"
              type="date"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
              defaultValue={dayjs().format("YYYY-MM-DD")}
            />
          </Box>
        </Box>
        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: 2,
            py: 2,
            bgcolor: "transparent",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default ListLayoutWithFilters;
