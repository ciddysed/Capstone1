package com.caps.eteeapp.controller;

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

import com.caps.eteeapp.model.Evaluation;
import com.caps.eteeapp.service.EvaluationService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @PostMapping("/forward-application/{applicantId}")
    public ResponseEntity<List<Evaluation>> forwardApplication(
            @PathVariable Long applicantId,
            @RequestBody Map<String, Long> requestBody) {
        Long departmentId = requestBody.get("departmentId");
        List<Evaluation> evaluations = evaluationService.forwardApplicantToDepartment(applicantId, departmentId);
        return ResponseEntity.ok(evaluations);
    }

    @PostMapping("/forward-to-department/{applicantId}")
    public ResponseEntity<List<Evaluation>> forwardToDepartment(@PathVariable Long applicantId) {
        List<Evaluation> evaluations = evaluationService.forwardApplicant(applicantId);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping
    public ResponseEntity<List<Evaluation>> getAllEvaluations() {
        List<Evaluation> evaluations = evaluationService.getAllEvaluations();
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/evaluator/{evaluatorId}")
    public ResponseEntity<List<Evaluation>> getEvaluationsByEvaluatorId(@PathVariable Long evaluatorId) {
        List<Evaluation> evaluations = evaluationService.getEvaluationsByEvaluatorId(evaluatorId);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<Evaluation>> getEvaluationsByApplicantId(@PathVariable Long applicantId) {
        List<Evaluation> evaluations = evaluationService.getEvaluationsByApplicantId(applicantId);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Evaluation>> getPendingEvaluations() {
        List<Evaluation> evaluations = evaluationService.getPendingEvaluations();
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Evaluation>> getAllEvaluationsIncludingPending() {
        // Fetch ALL evaluations without any filtering
        List<Evaluation> allEvaluations = evaluationService.getAllEvaluations();
        return ResponseEntity.ok(allEvaluations);
    }

    @GetMapping("/{evaluationId}")
    public ResponseEntity<Evaluation> getEvaluationById(@PathVariable Long evaluationId) {
        Optional<Evaluation> evaluation = evaluationService.findEvaluationById(evaluationId);
        if (evaluation.isPresent()) {
            return ResponseEntity.ok(evaluation.get());
        }
        return ResponseEntity.status(404).body(null);
    }

    @GetMapping("/check")
    public ResponseEntity<Evaluation> checkForExistingEvaluation(
            @RequestParam Long applicantId,
            @RequestParam Long courseId,
            @RequestParam Long evaluatorId) {
        Optional<Evaluation> evaluation = evaluationService.findExistingEvaluation(applicantId, courseId, evaluatorId);
        if (evaluation.isPresent()) {
            return ResponseEntity.ok(evaluation.get());
        }
        return ResponseEntity.status(404).body(null);
    }

    @PutMapping("/{evaluationId}/update-status")
    public ResponseEntity<Evaluation> updateEvaluationStatus(
            @PathVariable Long evaluationId,
            @RequestParam Evaluation.EvaluationStatus status) {
        Optional<Evaluation> evaluation = evaluationService.findEvaluationById(evaluationId);
        if (evaluation.isPresent()) {
            Evaluation updatedEvaluation = evaluationService.updateEvaluationStatus(evaluation.get(), status);
            return ResponseEntity.ok(updatedEvaluation);
        }
        return ResponseEntity.status(404).body(null);
    }

    @PostMapping
    public ResponseEntity<Evaluation> createEvaluation(@RequestBody Evaluation evaluation) {
        Evaluation createdEvaluation = evaluationService.createEvaluation(evaluation);
        return ResponseEntity.ok(createdEvaluation);
    }

    @PutMapping("/{evaluationId}")
    public ResponseEntity<Evaluation> updateEvaluation(
            @PathVariable Long evaluationId,
            @RequestBody Evaluation updatedEvaluation) {
        Optional<Evaluation> evaluation = evaluationService.findEvaluationById(evaluationId);
        if (evaluation.isPresent()) {
            Evaluation result = evaluationService.updateEvaluation(evaluation.get(), updatedEvaluation);
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(404).body(null);
    }
}
