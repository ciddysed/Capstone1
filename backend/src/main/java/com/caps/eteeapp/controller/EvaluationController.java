package com.caps.eteeapp.controller;

import com.caps.eteeapp.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<Object>> getEvaluationsByApplicantId(@PathVariable Long applicantId) {
        try {
            List<Object> evaluations = evaluationService.getEvaluationsByApplicantId(applicantId);
            return ResponseEntity.ok(evaluations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/forward-application/{applicantId}")
    public ResponseEntity<String> forwardApplicationForEvaluation(
            @PathVariable Long applicantId,
            @RequestBody Map<String, Object> requestBody) {
        try {
            Long courseId = Long.valueOf(requestBody.get("courseId").toString());
            Long applicationId = Long.valueOf(requestBody.get("applicationId").toString());
            
            evaluationService.forwardSingleCourseForEvaluation(applicantId, courseId, applicationId);
            
            return ResponseEntity.ok("Application forwarded successfully for evaluation");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to forward application: " + e.getMessage());
        }
    }

    @PostMapping("/forward-all-preferences/{applicantId}")
    public ResponseEntity<String> forwardAllPreferencesForEvaluation(
            @PathVariable Long applicantId,
            @RequestBody Map<String, Object> requestBody) {
        try {
            Long applicationId = Long.valueOf(requestBody.get("applicationId").toString());
            @SuppressWarnings("unchecked")
            List<Integer> courseIds = (List<Integer>) requestBody.get("courseIds");
            
            List<Long> courseIdsList = courseIds.stream()
                    .map(Integer::longValue)
                    .toList();
            
            int forwardedCount = evaluationService.forwardAllCoursesForEvaluation(applicantId, courseIdsList, applicationId);
            
            return ResponseEntity.ok("Successfully forwarded " + forwardedCount + " course preferences for evaluation");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to forward preferences: " + e.getMessage());
        }
    }
}
