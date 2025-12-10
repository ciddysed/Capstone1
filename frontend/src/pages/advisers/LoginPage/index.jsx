import React from "react";
import { Stack } from "@mui/material";

import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import EvaluatorAdviserLoginForm from "../../../components/Login/EvaluatorAdviserLoginForm";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";

const AdviserLoginPage = () => {
	const { handleSuccess, handleError, snackbar } = useResponseHandler();

	return (
		<MinimalLayout backgroundImage={backgroundImage}>
			<Stack alignItems="center" spacing={2}>
				<img src={logo} alt="Logo" />
				<EvaluatorAdviserLoginForm
					handleSuccess={handleSuccess}
					handleError={handleError}
					defaultRole="adviser"
				/>
			</Stack>
			{snackbar}
		</MinimalLayout>
	);
};

export default AdviserLoginPage;
