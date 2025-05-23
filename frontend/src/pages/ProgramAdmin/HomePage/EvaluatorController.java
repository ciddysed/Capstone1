package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.Evaluator;
import com.caps.eteeapp.service.EvaluatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/evaluators")
public class EvaluatorController {

    @Autowired
    private EvaluatorService evaluatorService;

    @GetMapping
    public ResponseEntity<List<Evaluator>> getAllEvaluators() {
        List<Evaluator> evaluators = evaluatorService.getAllEvaluators();
        return ResponseEntity.ok(evaluators);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Evaluator> getEvaluatorById(@PathVariable Long id) {
        Optional<Evaluator> evaluatorOpt = evaluatorService.findEvaluatorById(id);
        if (evaluatorOpt.isPresent()) {
            return ResponseEntity.ok(evaluatorOpt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/status")
    public ResponseEntity<?> getEvaluatorStatus(@PathVariable Long id) {
        Optional<Evaluator> evaluatorOpt = evaluatorService.findEvaluatorById(id);
        if (evaluatorOpt.isPresent()) {
            Evaluator evaluator = evaluatorOpt.get();
            // Update the logic to automatically consider admins as APPROVED
            // This ensures consistency with the frontend changes
            String status = evaluator.isAdmin() ? "APPROVED" : "PENDING";
            return ResponseEntity.ok(
                new EvaluatorStatusResponse(status, evaluator.isAdmin())
            );
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/admin-status")
    public ResponseEntity<Evaluator> updateAdminStatus(
            @PathVariable Long id,
            @RequestParam boolean isAdmin) {
        
        Optional<Evaluator> evaluatorOpt = evaluatorService.findEvaluatorById(id);
        
        if (evaluatorOpt.isPresent()) {
            Evaluator evaluator = evaluatorOpt.get();
            Evaluator updatedEvaluator = evaluatorService.updateAdminStatus(evaluator, isAdmin);
            return ResponseEntity.ok(updatedEvaluator);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Add POST endpoint for registration
    @PostMapping("/register")
    public ResponseEntity<?> registerEvaluator(@RequestBody Evaluator evaluator) {
        try {
            // Check if email already exists
            Optional<Evaluator> existingEvaluator = evaluatorService.findByEmail(evaluator.getEmail());
            if (existingEvaluator.isPresent()) {
                return ResponseEntity.badRequest().body("Email already registered");
            }
            
            // Register the new evaluator
            Evaluator registeredEvaluator = evaluatorService.registerEvaluator(evaluator);
            return ResponseEntity.ok(registeredEvaluator);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
    
    // Add POST endpoint for login
    @PostMapping("/login")
    public ResponseEntity<?> loginEvaluator(@RequestBody LoginRequest loginRequest) {
        try {
            Optional<Evaluator> evaluatorOpt = evaluatorService.loginEvaluator(
                loginRequest.getEmail(), 
                loginRequest.getPassword()
            );
            
            if (evaluatorOpt.isPresent()) {
                Evaluator evaluator = evaluatorOpt.get();
                Map<String, Object> response = new HashMap<>();
                response.put("evaluatorId", evaluator.getEvaluatorId());
                response.put("name", evaluator.getName());
                response.put("email", evaluator.getEmail());
                response.put("isAdmin", evaluator.isAdmin());
                response.put("role", evaluator.getRole());
                response.put("department", evaluator.getDepartment());
                
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
    
    // Nested class for status response
    private static class EvaluatorStatusResponse {
        private String status;
        private boolean isAdmin;
        
        public EvaluatorStatusResponse(String status, boolean isAdmin) {
            this.status = status;
            this.isAdmin = isAdmin;
        }
        
        public String getStatus() {
            return status;
        }
        
        public boolean isAdmin() {
            return isAdmin;
        }
    }
}
