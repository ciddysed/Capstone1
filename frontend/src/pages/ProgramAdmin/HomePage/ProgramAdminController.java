package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.ApplicantApplication;
import com.caps.eteeapp.model.ApplicationCoursePreference;
import com.caps.eteeapp.model.Document;
import com.caps.eteeapp.service.ApplicantApplicationService;
import com.caps.eteeapp.service.ApplicationCoursePreferenceService;
import com.caps.eteeapp.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
}
