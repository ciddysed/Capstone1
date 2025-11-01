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

import com.caps.eteeapp.model.ApplicantApplication;
import com.caps.eteeapp.model.ApplicationCoursePreference;
import com.caps.eteeapp.model.Document;
import com.caps.eteeapp.model.ProgramAdmin;
import com.caps.eteeapp.service.ApplicantApplicationService;
import com.caps.eteeapp.service.ApplicationCoursePreferenceService;
import com.caps.eteeapp.service.DocumentService;
import com.caps.eteeapp.service.ProgramAdminService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/program-admins")
public class ProgramAdminController {

    @Autowired
    private ApplicantApplicationService applicationService;

    @Autowired
    private ApplicationCoursePreferenceService preferenceService;
    
    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private ProgramAdminService programAdminService;

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicantApplication>> getAllApplications() {
        List<ApplicantApplication> applications = applicationService.getAllApplications();
        // Populate applicant name for easier display in frontend
        applications.forEach(app -> {
            if (app.getApplicant() != null) {
                // Create full name from applicant details
                String firstName = app.getApplicant().getFirstName() != null ? app.getApplicant().getFirstName() : "";
                String middleInitial = app.getApplicant().getMiddleInitial() != null ? app.getApplicant().getMiddleInitial() : "";
                String lastName = app.getApplicant().getLastName() != null ? app.getApplicant().getLastName() : "";
                
                String fullName = firstName;
                if (!middleInitial.isEmpty()) {
                    fullName += " " + middleInitial + ".";
                }
                if (!lastName.isEmpty()) {
                    fullName += " " + lastName;
                }
                
                // Use reflection to set applicantName dynamically or add as transient field
                try {
                    app.getClass().getMethod("setApplicantName", String.class).invoke(app, fullName);
                } catch (Exception e) {
                    // Field doesn't exist, handle appropriately
                }
            }
        });
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<ApplicantApplication> getApplicationById(@PathVariable Long id) {
        Optional<ApplicantApplication> applicationOpt = applicationService.getApplicationById(id);
        
        if (applicationOpt.isPresent()) {
            ApplicantApplication application = applicationOpt.get();
            
            // Populate course preferences
            Long applicantId = application.getApplicant().getApplicantId();
            List<ApplicationCoursePreference> preferences = preferenceService.getPreferencesByApplicantId(applicantId);
            application.setCoursePreferences(preferences);
            
            // Populate documents
            List<Document> documents = documentService.getDocumentsByApplicantId(applicantId);
            application.setDocuments(documents);
            
            return ResponseEntity.ok(application);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/applications/{id}/preferences")
    public ResponseEntity<List<ApplicationCoursePreference>> getCoursePreferencesByApplicantId(@PathVariable Long id) {
        // First get application to find its applicant
        Optional<ApplicantApplication> applicationOpt = applicationService.getApplicationById(id);
        
        if (applicationOpt.isPresent()) {
            Long applicantId = applicationOpt.get().getApplicant().getApplicantId();
            List<ApplicationCoursePreference> preferences = preferenceService.getPreferencesByApplicantId(applicantId);
            return ResponseEntity.ok(preferences);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/applications/{id}/documents")
    public ResponseEntity<List<Document>> getDocumentsByApplicationId(@PathVariable Long id) {
        // First get application to find its applicant
        Optional<ApplicantApplication> applicationOpt = applicationService.getApplicationById(id);
        
        if (applicationOpt.isPresent()) {
            Long applicantId = applicationOpt.get().getApplicant().getApplicantId();
            List<Document> documents = documentService.getDocumentsByApplicantId(applicantId);
            return ResponseEntity.ok(documents);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/applications/{id}/update-status")
    public ResponseEntity<ApplicantApplication> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) Long finalCourseId) {
        try {
            ApplicantApplication updatedApplication = applicationService.updateApplicationStatus(id, status, finalCourseId);
            return ResponseEntity.ok(updatedApplication);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/applications/{id}/assign-course")
    public ResponseEntity<String> assignCourse(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody) {
        try {
            Long applicantId = Long.valueOf(requestBody.get("applicantId").toString());
            Long courseId = Long.valueOf(requestBody.get("courseId").toString());
            
            // Logic to assign course to applicant
            applicationService.assignCourseToApplicant(applicantId, courseId);
            
            return ResponseEntity.ok("Course assigned successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to assign course: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<ProgramAdmin> createProgramAdmin(@RequestBody ProgramAdmin admin) {
        ProgramAdmin saved = programAdminService.createProgramAdmin(admin);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginProgramAdmin(@RequestBody LoginRequest loginRequest) {
        try {
            Optional<ProgramAdmin> programAdminOpt = programAdminService.loginProgramAdmin(
                loginRequest.getEmail(), 
                loginRequest.getPassword()
            );
            
            if (programAdminOpt.isPresent()) {
                ProgramAdmin programAdmin = programAdminOpt.get();
                Map<String, Object> response = new HashMap<>();
                response.put("adminId", programAdmin.getAdminId());
                response.put("name", programAdmin.getName());
                response.put("email", programAdmin.getEmail());
                response.put("role", programAdmin.getRole());
                response.put("contactNumber", programAdmin.getContactNumber());
                
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
}

