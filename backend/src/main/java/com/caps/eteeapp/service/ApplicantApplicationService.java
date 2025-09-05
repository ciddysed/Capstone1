package com.caps.eteeapp.service;

import com.caps.eteeapp.model.ApplicantApplication;
import com.caps.eteeapp.model.ApplicationCoursePreference;
import com.caps.eteeapp.model.Document;
import com.caps.eteeapp.repository.ApplicantApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ApplicantApplicationService {

    @Autowired
    private ApplicantApplicationRepository applicationRepository;

    public ApplicantApplication submitApplication(ApplicantApplication application) {
        // Set default status and other initial values
        application.setStatus("PENDING");
        return applicationRepository.save(application);
    }

    public List<ApplicantApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Optional<ApplicantApplication> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    public ApplicantApplication updateApplicationStatus(Long id, String status, Long finalCourseId) {
        return applicationRepository.findById(id).map(application -> {
            application.setStatus(status);
            // If approved and course ID is provided, set it as well
            if ("APPROVED".equals(status) && finalCourseId != null) {
                application.setFinalCourseId(finalCourseId);
            }
            return applicationRepository.save(application);
        }).orElseThrow(() -> new RuntimeException("Application not found with id " + id));
    }

    public void assignCourseToApplicant(Long applicantId, Long courseId) {
        // Implement logic to assign a course to an applicant
        // This could involve:
        // 1. Creating an assignment record
        // 2. Updating application status
        // 3. Notifying relevant parties
        
        System.out.println("Assigning course " + courseId + " to applicant " + applicantId);
        
        // Add your business logic here
        // Example:
        // - Find the applicant
        // - Find the course
        // - Create assignment record
        // - Update application status to APPROVED
        // - Send notifications
    }
}