package com.caps.eteeapp.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.caps.eteeapp.model.Evaluator;
import com.caps.eteeapp.service.EvaluatorService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/evaluators")
public class EvaluatorController {

    @Autowired
    private EvaluatorService evaluatorService;

    @PostMapping("/register")
    public ResponseEntity<Evaluator> registerEvaluator(@RequestBody Evaluator evaluator) {
        Evaluator registeredEvaluator = evaluatorService.registerEvaluator(evaluator);
        return ResponseEntity.ok(registeredEvaluator);
    }

    // In EvaluatorController.java
    @PostMapping("/login")
    public ResponseEntity<?> loginEvaluator(@RequestBody Evaluator loginRequest) {
        Optional<Evaluator> evaluator = evaluatorService.loginEvaluator(loginRequest.getEmail(), loginRequest.getPassword());
        if (evaluator.isPresent()) {
            return ResponseEntity.ok(evaluator.get());
        }
        return ResponseEntity.status(401).body("Invalid email or password.");
    }

    @PutMapping("/{evaluatorId}/update-admin-status") //updates isAdmin status
    public ResponseEntity<Evaluator> updateAdminStatus(@PathVariable Long evaluatorId, @RequestParam boolean isAdmin) {
        Optional<Evaluator> evaluator = evaluatorService.findEvaluatorById(evaluatorId);
        if (evaluator.isPresent()) {
            Evaluator updatedEvaluator = evaluatorService.updateAdminStatus(evaluator.get(), isAdmin);
            return ResponseEntity.ok(updatedEvaluator);
        }
        return ResponseEntity.status(404).body(null); // Not Found if evaluatorId does not exist
    }

  
}