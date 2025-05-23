package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.ApplicantApplication;
import com.caps.eteeapp.service.ApplicantApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/applications")
public class ApplicantApplicationController {

    @Autowired
    private ApplicantApplicationService applicationService;

    @PostMapping("/applicant/{applicantId}")
    public ResponseEntity<ApplicantApplication> createApplication(@PathVariable Long applicantId, @RequestBody ApplicantApplication application) {
        ApplicantApplication createdApplication = applicationService.createApplicationForApplicant(applicantId, application);
        return ResponseEntity.ok(createdApplication);
    }


    @GetMapping
    public ResponseEntity<List<ApplicantApplication>> getAllApplications() {
        List<ApplicantApplication> applications = applicationService.getAllApplications();
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicantApplication> getApplicationById(@PathVariable Long id) {
        return applicationService.getApplicationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicantApplication> updateApplication(@PathVariable Long id, @RequestBody ApplicantApplication updatedApplication) {
        try {
            ApplicantApplication application = applicationService.updateApplication(id, updatedApplication);
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<ApplicantApplication>> getApplicationsByApplicantId(@PathVariable Long applicantId) {
        List<ApplicantApplication> applications = applicationService.getApplicationsByApplicantId(applicantId);
        if (applications.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(applications);
    }
}
