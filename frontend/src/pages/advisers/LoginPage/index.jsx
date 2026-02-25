import React from "react";
import { Stack, Box } from "@mui/material";

import backgroundImage from "../../../assets/login2-bg.png";
import logo from "../../../assets/logo.png";
import EvaluatorAdviserLoginForm from "../../../components/Login/EvaluatorAdviserLoginForm";
import useResponseHandler from "../../../utils/useResponseHandler";

const AdviserLoginPage = () => {
	const { handleSuccess, handleError, snackbar } = useResponseHandler();

	return (
		<Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
			{/* Blurred, darkened background */}
			<Box
				sx={{
					position: "absolute",
					inset: 0,
					backgroundImage: `url(${backgroundImage})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					filter: "blur(4px) brightness(0.45)",
					transform: "scale(1.06)",
					zIndex: 0,
				}}
			/>

			{/* Centered content */}
			<Box
				sx={{
					position: "relative",
					zIndex: 1,
					height: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					overflowY: "auto",
					py: 5,
					px: 2,
				}}
			>
				<Stack alignItems="center" spacing={2.5} sx={{ width: "100%" }}>
					<img
						src={logo}
						alt="Logo"
						style={{
							width: 350,
							filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.6))",
						}}
					/>
					<EvaluatorAdviserLoginForm
						handleSuccess={handleSuccess}
						handleError={handleError}
						defaultRole="adviser"
						allowedRoles={["adviser"]}
					/>
				</Stack>
			</Box>

			{snackbar}
		</Box>
	);
};

export default AdviserLoginPage;