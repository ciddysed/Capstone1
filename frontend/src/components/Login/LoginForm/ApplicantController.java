package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.Applicant;
import com.caps.eteeapp.service.ApplicantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/applicants")
public class ApplicantController {

    private static final Logger logger = LoggerFactory.getLogger(ApplicantController.class);

    @Autowired
    private ApplicantService applicantService;

    @PostMapping("/register")
    public ResponseEntity<Applicant> registerApplicant(@RequestBody Applicant applicant) {
        Applicant registeredApplicant = applicantService.registerApplicant(applicant.getEmail(), applicant.getPassword());
        return ResponseEntity.ok(registeredApplicant);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginApplicant(@RequestBody Applicant loginRequest) {
        Optional<Applicant> applicant = applicantService.loginApplicant(loginRequest.getEmail(), loginRequest.getPassword());
        if (applicant.isPresent()) {
            Applicant loggedInApplicant = applicant.get();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful!");
            response.put("applicantId", loggedInApplicant.getApplicantId());
            if (loggedInApplicant.getFirstName() == null || loggedInApplicant.getLastName() == null) {
                response.put("profileIncomplete", true);
            } else {
                response.put("profileIncomplete", false);
            }
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(null); // Invalid email or password
    }

    @PutMapping("/update")
    public ResponseEntity<Applicant> updateApplicant(@RequestBody Applicant updatedApplicant) {
        if (updatedApplicant.getApplicantId() == null) {
            return ResponseEntity.status(400).body(null); // Bad Request if applicantId is missing
        }
        Optional<Applicant> applicant = applicantService.findApplicantById(updatedApplicant.getApplicantId());
        if (applicant.isPresent()) {
            Applicant updated = applicantService.updateApplicant(applicant.get(), updatedApplicant);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(404).body(null); // Not Found if applicantId does not exist
    }

    @PatchMapping("/{applicantId}/complete-profile")
    public ResponseEntity<Applicant> completeProfile(@PathVariable Long applicantId, @RequestBody Applicant updatedApplicant) {
        Optional<Applicant> applicant = applicantService.findApplicantById(applicantId);
        if (applicant.isPresent()) {
            Applicant updated = applicantService.updateApplicant(applicant.get(), updatedApplicant);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(404).body(null); // Not Found if applicantId does not exist
    }

    @GetMapping("/{id}")
    public ResponseEntity<Applicant> getApplicantById(@PathVariable Long id) {
        Optional<Applicant> applicant = applicantService.findApplicantById(id);
        if (applicant.isPresent()) {
            return ResponseEntity.ok(applicant.get());
        }
        return ResponseEntity.notFound().build(); // Return 404 if the applicant is not found
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        logger.info("=== FORGOT PASSWORD REQUEST START ===");
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
            logger.info("Calling applicantService.generatePasswordResetToken with email: '{}'", email);
            boolean tokenGenerated = applicantService.generatePasswordResetToken(email);
            logger.info("Service returned tokenGenerated: {}", tokenGenerated);
            
            // Always return a generic success message for security
            response.put("message", "If an account with this email exists, a password reset link has been sent.");
            logger.info("=== FORGOT PASSWORD REQUEST END - SUCCESS ===");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("=== FORGOT PASSWORD REQUEST END - ERROR ===");
            logger.error("Exception details:", e);
            
            // Still return the same generic message
            response.put("message", "If an account with this email exists, a password reset link has been sent.");
            return ResponseEntity.ok(response);
        }
    }

    @PutMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        logger.info("=== DIRECT RESET PASSWORD REQUEST START ===");
        logger.info("Raw request body: {}", request);
        
        String email = request.get("email");
        String newPassword = request.get("password");
        
        Map<String, String> response = new HashMap<>();

        logger.info("Extracted - email: '{}', password length: {}", 
                   email, newPassword != null ? newPassword.length() : "null");

        if (email != null && !email.trim().isEmpty()) {
            if (newPassword == null || newPassword.trim().isEmpty()) {
                logger.warn("Email-based reset: password is missing");
                response.put("message", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }

            try {
                logger.info("Calling applicantService.resetPasswordDirectly with email");
                boolean passwordReset = applicantService.resetPasswordDirectly(email, newPassword);
                logger.info("Service returned passwordReset: {}", passwordReset);
                
                if (passwordReset) {
                    response.put("message", "Password has been reset successfully");
                    logger.info("=== RESET PASSWORD REQUEST END - SUCCESS ===");
                    return ResponseEntity.ok(response);
                } else {
                    response.put("message", "Email not found or unable to reset password");
                    logger.info("=== RESET PASSWORD REQUEST END - EMAIL NOT FOUND ===");
                    return ResponseEntity.badRequest().body(response);
                }
            } catch (Exception e) {
                logger.error("=== RESET PASSWORD REQUEST END - ERROR ===");
                logger.error("Exception details:", e);
                response.put("message", "An error occurred while resetting your password. Please try again.");
                return ResponseEntity.status(500).body(response);
            }
        } else {
            logger.warn("Validation failed - email not provided");
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Remove token-related endpoints that we're not using
    
    // Keep the direct reset endpoint with the PutMapping as an alias
    @PostMapping("/reset-password-direct")
    public ResponseEntity<Map<String, String>> resetPasswordDirect(@RequestBody Map<String, String> request) {
        // Just delegate to the main reset-password endpoint
        return resetPassword(request);
    }
}
