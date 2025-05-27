package com.caps.eteeapp.service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.caps.eteeapp.model.Department;
import com.caps.eteeapp.model.Evaluation;
import com.caps.eteeapp.model.Evaluator;
import com.caps.eteeapp.repository.EvaluatorRepository;

@Service
public class EvaluatorService {

    private static final Logger logger = LoggerFactory.getLogger(EvaluatorService.class);

    @Autowired
    private EvaluatorRepository evaluatorRepository;

    public List<Evaluator> getAllEvaluators() {
        return evaluatorRepository.findAll();
    }

    public Evaluator registerEvaluator(Evaluator evaluator) {
        // Save the evaluator without modifying the isAdmin field
        return evaluatorRepository.save(evaluator);
    }

    public Optional<Evaluator> loginEvaluator(String email, String password) {
        Optional<Evaluator> evaluator = evaluatorRepository.findByEmail(email);
        if (evaluator.isPresent() && password.equals(evaluator.get().getPassword())) {
            return evaluator;
        }
        return Optional.empty();
    }

    public Optional<Evaluator> findEvaluatorById(Long evaluatorId) {
        return evaluatorRepository.findById(evaluatorId);
    }
    
    public Optional<Evaluator> findByEmail(String email) {
        return evaluatorRepository.findByEmail(email);
    }

    public Evaluator updateAdminStatus(Evaluator evaluator, boolean isAdmin) {
        evaluator.setAdmin(isAdmin);
        return evaluatorRepository.save(evaluator);
    }

    public List<Evaluation> getEvaluationsByDepartment(Department department) {
        // This method filters evaluations where the course department 
        // matches the given department
        return evaluatorRepository.findEvaluationsByCourseDepartment(department);
    }

    public boolean generatePasswordResetToken(String email) {
        logger.info("=== EVALUATOR SERVICE: generatePasswordResetToken START ===");
        logger.info("Input email: '{}'", email);
        
        try {
            logger.info("Calling evaluatorRepository.findByEmail");
            Optional<Evaluator> evaluatorOpt = evaluatorRepository.findByEmail(email);
            logger.info("Repository returned: {}", evaluatorOpt.isPresent() ? "Evaluator found" : "No evaluator found");
            
            if (evaluatorOpt.isPresent()) {
                Evaluator evaluator = evaluatorOpt.get();
                logger.info("Found evaluator - ID: {}, Email: {}", evaluator.getEvaluatorId(), evaluator.getEmail());
                
                String token = UUID.randomUUID().toString();
                logger.info("Generated UUID token: {}", token);
                
                evaluator.setPasswordResetToken(token);
                
                Calendar calendar = Calendar.getInstance();
                calendar.add(Calendar.HOUR, 1);
                Date expiryDate = calendar.getTime();
                evaluator.setPasswordResetTokenExpiry(expiryDate);
                
                logger.info("Set token: {} with expiry: {}", token, expiryDate);
                
                logger.info("Saving evaluator to database...");
                Evaluator savedEvaluator = evaluatorRepository.save(evaluator);
                logger.info("Successfully saved. Evaluator ID: {}, Token: {}, Expiry: {}", 
                           savedEvaluator.getEvaluatorId(), 
                           savedEvaluator.getPasswordResetToken(),
                           savedEvaluator.getPasswordResetTokenExpiry());
                
                System.out.println("=== CONSOLE OUTPUT ===");
                System.out.println("Password reset token for " + email + ": " + token);
                System.out.println("Reset URL would be: http://localhost:3000/reset-password?token=" + token);
                System.out.println("=== END CONSOLE OUTPUT ===");
                
                logger.info("=== EVALUATOR SERVICE: generatePasswordResetToken END - SUCCESS ===");
                return true;
            } else {
                logger.warn("=== EVALUATOR SERVICE: generatePasswordResetToken END - NO EVALUATOR FOUND ===");
                return false;
            }
        } catch (Exception e) {
            logger.error("=== EVALUATOR SERVICE: generatePasswordResetToken END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return false;
        }
    }

    public boolean resetPassword(String token, String newPassword) {
        logger.info("=== EVALUATOR SERVICE: resetPassword START ===");
        logger.info("Input token: '{}', password length: {}", token, newPassword.length());
        
        try {
            logger.info("Calling evaluatorRepository.findByPasswordResetToken");
            Optional<Evaluator> evaluatorOpt = evaluatorRepository.findByPasswordResetToken(token);
            logger.info("Repository returned: {}", evaluatorOpt.isPresent() ? "Evaluator found" : "No evaluator found");
            
            if (evaluatorOpt.isPresent()) {
                Evaluator evaluator = evaluatorOpt.get();
                logger.info("Found evaluator - ID: {}, Current token: {}", 
                           evaluator.getEvaluatorId(), evaluator.getPasswordResetToken());
                
                Date currentDate = new Date();
                Date tokenExpiry = evaluator.getPasswordResetTokenExpiry();
                
                logger.info("Time validation - Current: {}, Expiry: {}", currentDate, tokenExpiry);
                
                if (tokenExpiry != null && tokenExpiry.after(currentDate)) {
                    logger.info("Token is valid. Updating password...");
                    
                    evaluator.setPassword(newPassword);
                    evaluator.setPasswordResetToken(null);
                    evaluator.setPasswordResetTokenExpiry(null);
                    
                    logger.info("Saving updated evaluator...");
                    Evaluator savedEvaluator = evaluatorRepository.save(evaluator);
                    logger.info("Successfully updated evaluator ID: {}", savedEvaluator.getEvaluatorId());
                    
                    logger.info("=== EVALUATOR SERVICE: resetPassword END - SUCCESS ===");
                    return true;
                } else {
                    logger.warn("=== EVALUATOR SERVICE: resetPassword END - TOKEN EXPIRED ===");
                    return false;
                }
            } else {
                logger.warn("=== EVALUATOR SERVICE: resetPassword END - NO EVALUATOR FOUND ===");
                return false;
            }
        } catch (Exception e) {
            logger.error("=== EVALUATOR SERVICE: resetPassword END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return false;
        }
    }

    public boolean validateResetToken(String token) {
        logger.info("=== EVALUATOR SERVICE: validateResetToken START ===");
        logger.info("Input token: '{}'", token);
        
        try {
            logger.info("Calling evaluatorRepository.findByPasswordResetToken");
            Optional<Evaluator> evaluatorOpt = evaluatorRepository.findByPasswordResetToken(token);
            logger.info("Repository returned: {}", evaluatorOpt.isPresent() ? "Evaluator found" : "No evaluator found");
            
            if (evaluatorOpt.isPresent()) {
                Evaluator evaluator = evaluatorOpt.get();
                Date currentDate = new Date();
                Date tokenExpiry = evaluator.getPasswordResetTokenExpiry();
                
                logger.info("Found evaluator ID: {} for token validation", evaluator.getEvaluatorId());
                logger.info("Current date: {}, Token expiry: {}", currentDate, tokenExpiry);
                
                boolean isValid = tokenExpiry != null && tokenExpiry.after(currentDate);
                logger.info("Validation result: {}", isValid);
                
                logger.info("=== EVALUATOR SERVICE: validateResetToken END - SUCCESS ===");
                return isValid;
            } else {
                logger.warn("=== EVALUATOR SERVICE: validateResetToken END - NO EVALUATOR FOUND ===");
                return false;
            }
        } catch (Exception e) {
            logger.error("=== EVALUATOR SERVICE: validateResetToken END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return false;
        }
    }

    public boolean resetPasswordDirectly(String email, String newPassword) {
        logger.info("=== EVALUATOR SERVICE: resetPasswordDirectly START ===");
        logger.info("Input email: '{}', password length: {}", email, newPassword.length());
        
        try {
            logger.info("Calling evaluatorRepository.findByEmail");
            Optional<Evaluator> evaluatorOpt = evaluatorRepository.findByEmail(email);
            logger.info("Repository returned: {}", evaluatorOpt.isPresent() ? "Evaluator found" : "No evaluator found");
            
            if (evaluatorOpt.isPresent()) {
                Evaluator evaluator = evaluatorOpt.get();
                logger.info("Found evaluator - ID: {}, Email: {}", 
                           evaluator.getEvaluatorId(), evaluator.getEmail());
                
                logger.info("Updating password directly...");
                evaluator.setPassword(newPassword);
                
                // Clear any existing reset tokens
                evaluator.setPasswordResetToken(null);
                evaluator.setPasswordResetTokenExpiry(null);
                
                logger.info("Saving updated evaluator...");
                Evaluator savedEvaluator = evaluatorRepository.save(evaluator);
                logger.info("Successfully updated evaluator ID: {}", savedEvaluator.getEvaluatorId());
                
                logger.info("=== EVALUATOR SERVICE: resetPasswordDirectly END - SUCCESS ===");
                return true;
            } else {
                logger.warn("=== EVALUATOR SERVICE: resetPasswordDirectly END - NO EVALUATOR FOUND ===");
                return false;
            }
        } catch (Exception e) {
            logger.error("=== EVALUATOR SERVICE: resetPasswordDirectly END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return false;
        }
    }
}