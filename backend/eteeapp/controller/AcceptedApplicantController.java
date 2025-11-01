package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.AcceptedApplicant;
import com.caps.eteeapp.service.AcceptedApplicantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/accepted-applicants")
public class AcceptedApplicantController {

    @Autowired
    private AcceptedApplicantService acceptedApplicantService;

    @PostMapping("/accept")
    public ResponseEntity<AcceptedApplicant> acceptApplicant(
            @RequestParam("applicantId") Long applicantId,
            @RequestParam("finalCourseId") Long finalCourseId,
            @RequestParam(value = "remarks", required = false) String remarks) {

        AcceptedApplicant acceptedApplicant = acceptedApplicantService.acceptApplicant(applicantId, finalCourseId, remarks);
        return ResponseEntity.ok(acceptedApplicant);
    }

    @GetMapping
    public ResponseEntity<List<AcceptedApplicant>> getAllAcceptedApplicants() {
        List<AcceptedApplicant> acceptedApplicants = acceptedApplicantService.getAllAcceptedApplicants();
        return ResponseEntity.ok(acceptedApplicants);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AcceptedApplicant>> getAcceptedApplicantsByStatus(@PathVariable String status) {
        AcceptedApplicant.AcceptanceStatus acceptanceStatus = AcceptedApplicant.AcceptanceStatus.valueOf(status.toUpperCase());
        List<AcceptedApplicant> acceptedApplicants = acceptedApplicantService.getAcceptedApplicantsByStatus(acceptanceStatus);
        return ResponseEntity.ok(acceptedApplicants);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AcceptedApplicant>> getAcceptedApplicantsByCourse(@PathVariable Long courseId) {
        List<AcceptedApplicant> acceptedApplicants = acceptedApplicantService.getAcceptedApplicantsByCourse(courseId);
        return ResponseEntity.ok(acceptedApplicants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcceptedApplicant> getAcceptedApplicantById(@PathVariable Long id) {
        Optional<AcceptedApplicant> acceptedApplicant = acceptedApplicantService.getAcceptedApplicantById(id);
        return acceptedApplicant.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<AcceptedApplicant> getAcceptedApplicantByApplicantId(@PathVariable Long applicantId) {
        Optional<AcceptedApplicant> acceptedApplicant = acceptedApplicantService.getAcceptedApplicantByApplicantId(applicantId);
        return acceptedApplicant.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AcceptedApplicant> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "remarks", required = false) String remarks) {

        AcceptedApplicant.AcceptanceStatus acceptanceStatus = AcceptedApplicant.AcceptanceStatus.valueOf(status.toUpperCase());
        AcceptedApplicant updatedApplicant = acceptedApplicantService.updateAcceptedApplicantStatus(id, acceptanceStatus, remarks);
        return ResponseEntity.ok(updatedApplicant);
    }

    @PutMapping("/{id}/course")
    public ResponseEntity<AcceptedApplicant> updateFinalCourse(
            @PathVariable Long id,
            @RequestParam("courseId") Long courseId) {

        AcceptedApplicant updatedApplicant = acceptedApplicantService.updateFinalCourse(id, courseId);
        return ResponseEntity.ok(updatedApplicant);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAcceptedApplicant(@PathVariable Long id) {
        acceptedApplicantService.deleteAcceptedApplicant(id);
        return ResponseEntity.noContent().build();
    }
}
