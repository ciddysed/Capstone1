package com.caps.eteeapp.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.caps.eteeapp.model.Department;
import com.caps.eteeapp.model.Evaluator;
import com.caps.eteeapp.service.DepartmentService;
import com.caps.eteeapp.service.EvaluatorService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/evaluators")
public class EvaluatorController {

    private static final Logger logger = LoggerFactory.getLogger(EvaluatorController.class);

    @Autowired
    private EvaluatorService evaluatorService;
    
    @Autowired
    private DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<Evaluator>> getAllEvaluators() {
        List<Evaluator> evaluators = evaluatorService.getAllEvaluators();
        return ResponseEntity.ok(evaluators);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Evaluator> getEvaluatorById(@PathVariable Long id) {
        Optional<Evaluator> evaluatorOpt = evaluatorService.findEvaluatorById(id);
        if (evaluatorOpt.isPresent()) {
            return ResponseEntity.ok(evaluatorOpt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/status")
    public ResponseEntity<?> getEvaluatorStatus(@PathVariable Long id) {
        Optional<Evaluator> evaluatorOpt = evaluatorService.findEvaluatorById(id);
        if (evaluatorOpt.isPresent()) {
            Evaluator evaluator = evaluatorOpt.get();
            // Update the logic to automatically consider admins as APPROVED
            // This ensures consistency with the frontend changes
            String status = evaluator.isAdmin() ? "APPROVED" : "PENDING";
            return ResponseEntity.ok(
                new EvaluatorStatusResponse(status, evaluator.isAdmin())
            );
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/admin-status")
    public ResponseEntity<Evaluator> updateAdminStatus(
            @PathVariable Long id,
            @RequestParam boolean isAdmin) {
        
        Optional<Evaluator> evaluatorOpt = evaluatorService.findEvaluatorById(id);
        
        if (evaluatorOpt.isPresent()) {
            Evaluator evaluator = evaluatorOpt.get();
            Evaluator updatedEvaluator = evaluatorService.updateAdminStatus(evaluator, isAdmin);
            return ResponseEntity.ok(updatedEvaluator);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        List<Department> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }
    
    // Add POST endpoint for registration
    @PostMapping("/register")
    public ResponseEntity<?> registerEvaluator(@RequestBody RegistrationRequest registrationRequest) {
        logger.info("=== EVALUATOR REGISTRATION REQUEST START ===");
        logger.info("Registration request received: {}", registrationRequest.toString());
        
        try {
            // Validate required fields
            if (registrationRequest.getName() == null || registrationRequest.getName().trim().isEmpty()) {
                logger.warn("Validation failed - name is required");
                return ResponseEntity.badRequest().body(createErrorResponse("Name is required"));
            }
            if (registrationRequest.getEmail() == null || registrationRequest.getEmail().trim().isEmpty()) {
                logger.warn("Validation failed - email is required");
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }
            if (registrationRequest.getPassword() == null || registrationRequest.getPassword().trim().isEmpty()) {
                logger.warn("Validation failed - password is required");
                return ResponseEntity.badRequest().body(createErrorResponse("Password is required"));
            }
            if (registrationRequest.getDepartment() == null || registrationRequest.getDepartment().trim().isEmpty()) {
                logger.warn("Validation failed - department is required");
                return ResponseEntity.badRequest().body(createErrorResponse("Department is required"));
            }
            
            // Check if email already exists
            Optional<Evaluator> existingEvaluator = evaluatorService.findByEmail(registrationRequest.getEmail());
            if (existingEvaluator.isPresent()) {
                logger.warn("Registration failed - email already exists: {}", registrationRequest.getEmail());
                return ResponseEntity.badRequest().body(createErrorResponse("Email already registered"));
            }
            
            // Find department by name
            logger.info("Looking up department: {}", registrationRequest.getDepartment());
            Optional<Department> department = departmentService.findByDepartmentName(registrationRequest.getDepartment());
            if (!department.isPresent()) {
                logger.warn("Department not found: {}", registrationRequest.getDepartment());
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid department selected: " + registrationRequest.getDepartment()));
            }
            
            logger.info("Department found: {} (ID: {})", department.get().getDepartmentName(), department.get().getDepartmentId());
            
            // Create new evaluator from registration request
            Evaluator evaluator = new Evaluator();
            evaluator.setName(registrationRequest.getName());
            evaluator.setEmail(registrationRequest.getEmail());
            evaluator.setPassword(registrationRequest.getPassword());
            evaluator.setContactNumber(registrationRequest.getContactNumber());
            evaluator.setRole(registrationRequest.getRole());
            evaluator.setDepartment(department.get());
            evaluator.setAdmin(false); // Set default admin status
            
            logger.info("Saving evaluator with department ID: {}", department.get().getDepartmentId());
            
            // Register the new evaluator
            Evaluator registeredEvaluator = evaluatorService.registerEvaluator(evaluator);
            
            // Create success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful!");
            response.put("evaluatorId", registeredEvaluator.getEvaluatorId());
            
            logger.info("=== EVALUATOR REGISTRATION REQUEST END - SUCCESS ===");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("=== EVALUATOR REGISTRATION REQUEST END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return ResponseEntity.status(500).body(createErrorResponse("Registration failed: " + e.getMessage()));
        }
    }
    
    // Helper method to create error response
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return response;
    }
    
    // Add POST endpoint for login
    @PostMapping("/login")
    public ResponseEntity<?> loginEvaluator(@RequestBody LoginRequest loginRequest) {
        try {
            Optional<Evaluator> evaluatorOpt = evaluatorService.loginEvaluator(
                loginRequest.getEmail(), 
                loginRequest.getPassword()
            );
            
            if (evaluatorOpt.isPresent()) {
                Evaluator evaluator = evaluatorOpt.get();
                Map<String, Object> response = new HashMap<>();
                response.put("evaluatorId", evaluator.getEvaluatorId());
                response.put("name", evaluator.getName());
                response.put("email", evaluator.getEmail());
                response.put("isAdmin", evaluator.isAdmin());
                response.put("role", evaluator.getRole());
                response.put("department", evaluator.getDepartment());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body("Invalid email or password");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Login failed: " + e.getMessage());
        }
    }
    
    // Nested class for login request
    private static class LoginRequest {
        private String email;
        private String password;
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
        
        public String getPassword() {
            return password;
        }
        
        public void setPassword(String password) {
            this.password = password;
        }
    }
    
    // Nested class for status response
    private static class EvaluatorStatusResponse {
        private String status;
        private boolean isAdmin;
        
        public EvaluatorStatusResponse(String status, boolean isAdmin) {
            this.status = status;
            this.isAdmin = isAdmin;
        }
        
        public String getStatus() {
            return status;
        }
        
        public boolean isAdmin() {
            return isAdmin;
        }
    }
    
    // Nested class for registration request
    private static class RegistrationRequest {
        private String name;
        private String email;
        private String password;
        private String contactNumber;
        private String role;
        private String department;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getContactNumber() { return contactNumber; }
        public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        
        @Override
        public String toString() {
            return "RegistrationRequest{" +
                    "name='" + name + '\'' +
                    ", email='" + email + '\'' +
                    ", contactNumber='" + contactNumber + '\'' +
                    ", role='" + role + '\'' +
                    ", department='" + department + '\'' +
                    '}';
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        logger.info("=== EVALUATOR FORGOT PASSWORD REQUEST START ===");
        logger.info("Raw request body: {}", request);
        
        String email = request.get("email");
        Map<String, String> response = new HashMap<>();

        logger.info("Extracted email from request: '{}'", email);

        if (email == null || email.trim().isEmpty()) {
            logger.warn("Email validation failed - email is null or empty");
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            logger.info("Calling evaluatorService.generatePasswordResetToken with email: '{}'", email);
            boolean tokenGenerated = evaluatorService.generatePasswordResetToken(email);
            logger.info("Service returned tokenGenerated: {}", tokenGenerated);
            
            response.put("message", "If an account with this email exists, a password reset link has been sent.");
            response.put("debug_token_generated", String.valueOf(tokenGenerated));
            logger.info("=== EVALUATOR FORGOT PASSWORD REQUEST END - SUCCESS ===");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("=== EVALUATOR FORGOT PASSWORD REQUEST END - ERROR ===");
            logger.error("Exception details:", e);
            response.put("message", "An error occurred while processing your request. Please try again.");
            response.put("error_details", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        logger.info("=== EVALUATOR RESET PASSWORD REQUEST START ===");
        logger.info("Raw request body: {}", request);
        
        String token = request.get("token");
        String email = request.get("email");
        String newPassword = request.get("password");
        String newPasswordFromField = request.get("newPassword");
        
        if (newPassword == null && newPasswordFromField != null) {
            newPassword = newPasswordFromField;
        }
        
        Map<String, String> response = new HashMap<>();

        logger.info("Extracted - token: '{}', email: '{}', password length: {}", 
                   token, email, newPassword != null ? newPassword.length() : "null");

        // Handle token-based reset (from email link)
        if (token != null && !token.trim().isEmpty()) {
            if (newPassword == null || newPassword.trim().isEmpty()) {
                logger.warn("Token-based reset: password is missing");
                response.put("message", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }

            try {
                logger.info("Calling evaluatorService.resetPassword with token");
                boolean passwordReset = evaluatorService.resetPassword(token, newPassword);
                logger.info("Service returned passwordReset: {}", passwordReset);
                
                if (passwordReset) {
                    response.put("message", "Password has been reset successfully");
                    logger.info("=== EVALUATOR RESET PASSWORD REQUEST END - SUCCESS ===");
                    return ResponseEntity.ok(response);
                } else {
                    response.put("message", "Invalid or expired reset token");
                    logger.info("=== EVALUATOR RESET PASSWORD REQUEST END - INVALID TOKEN ===");
                    return ResponseEntity.badRequest().body(response);
                }
            } catch (Exception e) {
                logger.error("=== EVALUATOR RESET PASSWORD REQUEST END - ERROR ===");
                logger.error("Exception details:", e);
                response.put("message", "An error occurred while resetting your password. Please try again.");
                return ResponseEntity.status(500).body(response);
            }
        }
        
        // Handle direct email-based reset (without token)
        else if (email != null && !email.trim().isEmpty()) {
            if (newPassword == null || newPassword.trim().isEmpty()) {
                logger.warn("Email-based reset: password is missing");
                response.put("message", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }

            try {
                logger.info("Calling evaluatorService.resetPasswordDirectly with email");
                boolean passwordReset = evaluatorService.resetPasswordDirectly(email, newPassword);
                logger.info("Service returned passwordReset: {}", passwordReset);
                
                if (passwordReset) {
                    response.put("message", "Password has been reset successfully");
                    logger.info("=== EVALUATOR RESET PASSWORD REQUEST END - SUCCESS ===");
                    return ResponseEntity.ok(response);
                } else {
                    response.put("message", "Email not found or unable to reset password");
                    logger.info("=== EVALUATOR RESET PASSWORD REQUEST END - EMAIL NOT FOUND ===");
                    return ResponseEntity.badRequest().body(response);
                }
            } catch (Exception e) {
                logger.error("=== EVALUATOR RESET PASSWORD REQUEST END - ERROR ===");
                logger.error("Exception details:", e);
                response.put("message", "An error occurred while resetting your password. Please try again.");
                return ResponseEntity.status(500).body(response);
            }
        }
        
        // Neither token nor email provided
        else {
            logger.warn("Validation failed - neither token nor email provided");
            response.put("message", "Either token or email is required");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/validate-reset-token/{token}")
    public ResponseEntity<Map<String, Boolean>> validateResetToken(@PathVariable String token) {
        logger.info("=== EVALUATOR VALIDATE TOKEN REQUEST START ===");
        logger.info("Token to validate: '{}'", token);
        
        Map<String, Boolean> response = new HashMap<>();
        
        try {
            logger.info("Calling evaluatorService.validateResetToken");
            boolean isValid = evaluatorService.validateResetToken(token);
            logger.info("Service returned isValid: {}", isValid);
            
            response.put("valid", isValid);
            logger.info("=== EVALUATOR VALIDATE TOKEN REQUEST END - SUCCESS ===");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("=== EVALUATOR VALIDATE TOKEN REQUEST END - ERROR ===");
            logger.error("Exception details:", e);
            response.put("valid", false);
            return ResponseEntity.ok(response);
        }
    }
}
