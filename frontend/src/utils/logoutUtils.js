// Utility function to handle logout with proper redirection
export const handleLogout = (navigate) => {
  const userType = localStorage.getItem("userType");
  
  // Clear all localStorage data immediately
  localStorage.clear();
  
  // Redirect to appropriate login page based on user type
  if (userType === "evaluator") {
    navigate("/evaluator/login");
  } else if (userType === "adviser") {
    navigate("/adviser/login");
  } else if (userType === "program-admin") {
    navigate("/program-admin/login");
  } else {
    // Default to applicant login
    navigate("/login");
  }
};

const logoutUtils = { handleLogout };
export default logoutUtils;