package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.ApplicationCoursePreference;
import com.caps.eteeapp.service.ApplicationCoursePreferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/preferences")
public class ApplicationCoursePreferenceController {

    @Autowired
    private ApplicationCoursePreferenceService preferenceService;

    @PostMapping
    public ResponseEntity<ApplicationCoursePreference> createPreference(@RequestBody ApplicationCoursePreference preference) {
        ApplicationCoursePreference createdPreference = preferenceService.createPreference(preference);
        return ResponseEntity.ok(createdPreference);
    }

    @PostMapping("/applicant/{applicantId}")
    public ResponseEntity<ApplicationCoursePreference> createPreference(
            @PathVariable Long applicantId,
            @RequestBody ApplicationCoursePreference preference) {
        ApplicationCoursePreference createdPreference = preferenceService.createPreferenceForApplicant(applicantId, preference);
        return ResponseEntity.ok(createdPreference);
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<ApplicationCoursePreference>> getPreferencesByApplicantId(@PathVariable Long applicantId) {
        List<ApplicationCoursePreference> preferences = preferenceService.getPreferencesByApplicantId(applicantId);
        return ResponseEntity.ok(preferences);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePreference(@PathVariable Long id) {
        preferenceService.deletePreference(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{preferenceId}/update-status")
    public ResponseEntity<ApplicationCoursePreference> updatePreferenceStatus(
            @PathVariable Long preferenceId,
            @RequestParam ApplicationCoursePreference.Status status) {
        Optional<ApplicationCoursePreference> preference = preferenceService.getPreferenceById(preferenceId);
        if (preference.isPresent()) {
            ApplicationCoursePreference updatedPreference = preferenceService.updatePreferenceStatus(preference.get(), status);
            return ResponseEntity.ok(updatedPreference);
        }
        return ResponseEntity.status(404).body(null); // Not Found if preferenceId does not exist
    }
}
