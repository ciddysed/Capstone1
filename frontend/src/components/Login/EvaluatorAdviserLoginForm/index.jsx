import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	TextField,
	Button,
	Typography,
	Link,
	Paper,
	Stack,
	styled,
	MenuItem,
	Divider,
	ToggleButtonGroup,
	ToggleButton,
	Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const roleConfigs = {
	evaluator: {
		label: "Evaluator",
		apiBase: "https://eteeap-foth.onrender.com/api/evaluators",
		idKey: "evaluatorId",
		defaultHome: "/evaluator/homepage",
		adminHome: "/evaluator/applicants",
		forgotPasswordPath: "/evaluator/forget-password",
	},
	adviser: {
		label: "Adviser",
		apiBase: "https://eteeap-foth.onrender.com/api/evaluators",
		idKey: "evaluatorId",
		defaultHome: "/adviser/homepage",
		adminHome: "/adviser/homepage",
		forgotPasswordPath: "/evaluator/forget-password",
	},
};

const roleOptions = [
  {
    key: "evaluator",
    title: "Evaluator",
  },
  {
    key: "adviser",
    title: "Adviser",
  },
];

const getValidationSchema = (formType) =>
	yup.object().shape({
		email: yup.string().email("Invalid email").required("Email is required"),
		password: yup
			.string()
			.min(8, "Minimum 8 characters")
			.required("Password is required"),
		...(formType === "signup" && {
			reEnterPassword: yup
				.string()
				.oneOf([yup.ref("password")], "Passwords must match")
				.required("Please re-enter password"),
			name: yup.string().required("Full name is required"),
			contactNumber: yup
				.string()
				.matches(/^[0-9+\-\s()]+$/, "Invalid contact number")
				.required("Contact number is required"),
			role: yup.string().required("Role is required"),
			department: yup.string().required("Department is required"),
		}),
	});

const EvaluatorAdviserLoginForm = ({
	formType = "login",
	defaultRole = "evaluator",
	handleSuccess,
	handleError,
}) => {
	const [currentFormType, setCurrentFormType] = useState(formType);
	const [currentRole, setCurrentRole] = useState(defaultRole);
	const [departments, setDepartments] = useState([]);
	const navigate = useNavigate();

	const schema = useMemo(
		() => getValidationSchema(currentFormType),
		[currentFormType]
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			role: defaultRole,
		},
	});

	const clearStoredIds = () => {
		localStorage.removeItem("applicantId");
		localStorage.removeItem("evaluatorId");
		localStorage.removeItem("adviserId");
		localStorage.removeItem("programAdminId");
		localStorage.removeItem("systemAdminId");
	};

	useEffect(() => {
		if (currentFormType === "signup") {
			fetchDepartments();
		}
	}, [currentFormType, currentRole]);

	const fetchDepartments = async () => {
		const { apiBase } = roleConfigs[currentRole];
		try {
			const response = await fetch(`${apiBase}/departments`);
			if (response.ok) {
				const departmentData = await response.json();
				setDepartments(departmentData);
			} else {
				console.error("Failed to fetch departments");
				setDepartments([]);
			}
		} catch (error) {
			console.error("Error fetching departments:", error);
			setDepartments([]);
		}
	};

	const onSubmit = async (data) => {
		// Use the role from form data in signup, otherwise use currentRole
		const submitRole = currentFormType === "signup" ? data.role : currentRole;
		const { apiBase, idKey, defaultHome, adminHome } = roleConfigs[submitRole];

		try {
			if (currentFormType === "signup") {
				const response = await fetch(`${apiBase}/register`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: data.email,
						password: data.password,
						name: data.name,
						contactNumber: data.contactNumber,
						department: data.department,
					}),
				});

				const contentType = response.headers.get("content-type");
				const result = contentType?.includes("application/json")
					? await response.json()
					: await response.text();

				if (!response.ok) {
					const errorMessage =
						typeof result === "string"
							? result
							: result?.message || "Registration failed.";
					handleError?.(errorMessage);
					return;
				}

				handleSuccess?.(`${roleConfigs[currentRole].label} signup successful! Please log in.`);
				reset();
				setCurrentFormType("login");
				return;
			}

			const response = await fetch(`${apiBase}/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: data.email, password: data.password }),
			});

			const contentType = response.headers.get("content-type");
			const result = contentType?.includes("application/json")
				? await response.json()
				: await response.text();

			let isAdmin = false;
			if (typeof result === "object" && result !== null) {
				if ("admin" in result) {
					isAdmin = Boolean(result.admin);
				} else if ("isAdmin" in result) {
					isAdmin = Boolean(result.isAdmin);
				} else if ("role" in result && typeof result.role === "string") {
					isAdmin = result.role.toLowerCase() === "admin";
				}
			}

			if (response.status === 200 && typeof result === "object" && result !== null) {
				clearStoredIds();
				const resolvedId =
					(idKey in result && result[idKey]) ||
					(currentRole === "adviser" && result.evaluatorId) ||
					result.id ||
					result.userId;
				if (resolvedId) {
					localStorage.setItem(idKey, resolvedId);
				}
				localStorage.setItem("userType", currentRole);

				handleSuccess?.("Login successful!");

				if (isAdmin) {
					navigate(adminHome);
				} else {
					navigate(defaultHome);
				}
			} else {
				localStorage.removeItem(idKey);
				handleError?.(
					typeof result === "string" ? result : "Invalid email or password."
				);
			}
		} catch (error) {
			console.error("Auth error:", error);
			handleError?.("Something went wrong. Please try again.");
		}
	};

	const handleFormToggle = (event, newFormType) => {
		if (newFormType) {
			setCurrentFormType(newFormType);
			reset();
		}
	};

	return (
		<StyledPaper elevation={6}>
			<Stack gap={1} alignItems="center">
				<Typography variant="h5" textAlign="center" fontWeight="bold">
					{currentFormType === "login" ? "Login Form" : "Signup Form"}
				</Typography>

				<ToggleButtonGroup
					value={currentFormType}
					exclusive
					onChange={handleFormToggle}
					aria-label="Login or Signup"
				>
					<StyledToggleButton value="login">Login</StyledToggleButton>
					<StyledToggleButton value="signup">Signup</StyledToggleButton>
				</ToggleButtonGroup>
			</Stack>

			<Divider sx={{ my: 2 }} />

			<Stack gap={2}>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					{currentFormType === "signup" && (
						<StyledTextField
							type="text"
							fullWidth
							placeholder="Enter your full name"
							variant="outlined"
							size="small"
							{...register("name")}
							error={!!errors.name}
							helperText={errors.name?.message}
						/>
					)}

					<StyledTextField
						type="email"
						fullWidth
						placeholder="Enter your email"
						variant="outlined"
						size="small"
						{...register("email")}
						error={!!errors.email}
						helperText={errors.email?.message}
					/>

					{currentFormType === "signup" && (
						<>
							<StyledTextField
								type="tel"
								fullWidth
								placeholder="Enter your contact number"
								variant="outlined"
								size="small"
								{...register("contactNumber")}
								error={!!errors.contactNumber}
								helperText={errors.contactNumber?.message}
							/>

							<StyledTextField
								select
								fullWidth
								label="Select Role"
								placeholder="Choose your role"
								variant="outlined"
								size="small"
								{...register("role")}
								error={!!errors.role}
								helperText={errors.role?.message}
								onChange={(e) => {
									setCurrentRole(e.target.value);
									setValue("role", e.target.value);
								}}
							>
								{roleOptions.map((role) => (
									<MenuItem key={role.key} value={role.key}>
										{role.title}
									</MenuItem>
								))}
							</StyledTextField>

							<StyledTextField
								select
								fullWidth
								label="Select Department"
								placeholder="Select your department"
								variant="outlined"
								size="small"
								{...register("department")}
								error={!!errors.department}
								helperText={errors.department?.message}
							>
								{departments.length > 0 ? (
									departments.map((dept) => (
										<MenuItem key={dept.departmentId || dept.departmentName} value={dept.departmentName}>
											{dept.departmentName}
										</MenuItem>
									))
								) : (
									<MenuItem value="" disabled>
										Loading departments...
									</MenuItem>
								)}
							</StyledTextField>
						</>
					)}

					<StyledTextField
						type="password"
						fullWidth
						placeholder="Enter your password"
						variant="outlined"
						size="small"
						{...register("password")}
						error={!!errors.password}
						helperText={errors.password?.message}
					/>

					{currentFormType === "signup" && (
						<StyledTextField
							type="password"
							placeholder="Re-enter your password"
							variant="outlined"
							size="small"
							fullWidth
							{...register("reEnterPassword")}
							error={!!errors.reEnterPassword}
							helperText={errors.reEnterPassword?.message}
						/>
					)}

					{currentFormType === "login" && (
						<Stack direction="row" justifyContent="flex-start">
							<Link
								component="button"
								variant="body2"
								onClick={() => navigate(roleConfigs[currentRole].forgotPasswordPath)}
								sx={{
									color: "black",
									textDecoration: "underline",
									cursor: "pointer",
									background: "none",
									border: "none",
									padding: 0,
								}}
							>
								Forgot password?
							</Link>
						</Stack>
					)}

					<Button
						type="submit"
						variant="contained"
						fullWidth
						sx={{ backgroundColor: "#800000", borderRadius: "20px" }}
					>
						{currentFormType === "login" ? "Login" : "Signup"}
					</Button>
				</form>
			</Stack>
		</StyledPaper>
	);
};

export const StyledTextField = styled(TextField)({
	marginBottom: 8,
	backgroundColor: "#D9D9D9",
	borderRadius: "12px",
	"& .MuiOutlinedInput-root": {
		borderRadius: "12px",
	},
	"& .MuiOutlinedInput-notchedOutline": {
		borderRadius: "12px",
	},
});

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
	backgroundColor: "#f5f5f5",
	color: "black",
	"&.Mui-selected": {
		backgroundColor: "#800000",
		color: "white",
	},
	"&:hover": {
		backgroundColor: "#800000",
		color: "white",
	},
}));

const RoleCard = styled(Box)(({ selected }) => ({
	flex: 1,
	padding: 16,
	borderRadius: 12,
	border: selected ? "2px solid #800000" : "1px solid #d9d9d9",
	background: selected
		? "linear-gradient(145deg, rgba(128, 0, 0, 0.08), rgba(255, 255, 255, 0.8))"
		: "linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(245, 245, 245, 0.9))",
	boxShadow: selected
		? "0 8px 20px rgba(128, 0, 0, 0.18)"
		: "0 4px 12px rgba(0, 0, 0, 0.08)",
	cursor: "pointer",
	transition: "all 0.2s ease",
	outline: "none",
	display: "flex",
	flexDirection: "column",
	gap: 4,
	"&:hover": {
		transform: "translateY(-2px)",
		boxShadow: "0 10px 24px rgba(128, 0, 0, 0.18)",
	},
	"&:focus-visible": {
		boxShadow: "0 0 0 3px rgba(128, 0, 0, 0.25)",
	},
}));

export const StyledPaper = styled(Paper)({
	padding: 32,
	width: "100%",
	maxWidth: 500,
	display: "flex",
	flexDirection: "column",
	gap: 16,
	borderRadius: 16,
	background:
		"linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(128, 128, 128, 0.6))",
	boxShadow: "inset 0px 0px 10px rgba(255, 255, 255, 0.5)",
});

export default EvaluatorAdviserLoginForm;
