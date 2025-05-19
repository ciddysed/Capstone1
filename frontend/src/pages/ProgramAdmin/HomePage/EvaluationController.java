package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.Evaluation;
import com.caps.eteeapp.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @PostMapping("/forward-application/{applicationId}")
    public ResponseEntity<List<Evaluation>> forwardApplication(@PathVariable Long applicationId) {
        List<Evaluation> evaluations = evaluationService.forwardApplication(applicationId);
        return ResponseEntity.ok(evaluations);
    }

    @PostMapping("/forward-to-department/{applicationId}")
    public ResponseEntity<List<Evaluation>> forwardToDepartment(@PathVariable Long applicationId) {
        List<Evaluation> evaluations = evaluationService.forwardToDepartment(applicationId);
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

    @GetMapping("/{evaluationId}")
    public ResponseEntity<Evaluation> getEvaluationById(@PathVariable Long evaluationId) {
        Optional<Evaluation> evaluation = evaluationService.findEvaluationById(evaluationId);
        if (evaluation.isPresent()) {
            return ResponseEntity.ok(evaluation.get());
        }
        return ResponseEntity.status(404).body(null); // Not Found if evaluationId does not exist
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
        return ResponseEntity.status(404).body(null); // Not Found if evaluationId does not exist
    }
}
