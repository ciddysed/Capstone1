package com.caps.eteeapp.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.caps.eteeapp.model.Applicant;
import com.caps.eteeapp.model.ApplicantSubjectRecord;
import com.caps.eteeapp.model.Curriculum;
import com.caps.eteeapp.model.Semester;
import com.caps.eteeapp.model.Subject;
import com.caps.eteeapp.repository.ApplicantRepository;

@Service
public class ApplicantService {

    private static final Logger logger = LoggerFactory.getLogger(ApplicantService.class);

    @Autowired
    private ApplicantRepository applicantRepository;

    public Applicant registerApplicant(String email, String password) {
        Applicant applicant = new Applicant();
        applicant.setEmail(email);
        applicant.setPassword(password);
        return applicantRepository.save(applicant);
    }
    
    public Applicant registerCompleteApplicant(Applicant applicant) {
        logger.info("=== SERVICE: registerCompleteApplicant START ===");
        logger.info("Registering applicant with complete profile: {}", applicant.getEmail());
        
        try {
            // Check if email already exists
            Optional<Applicant> existingApplicant = applicantRepository.findByEmail(applicant.getEmail());
            if (existingApplicant.isPresent()) {
                logger.warn("Email already exists: {}", applicant.getEmail());
                return null;
            }
            
            // Save the applicant with all profile details
            Applicant savedApplicant = applicantRepository.save(applicant);
            logger.info("Successfully registered applicant with ID: {}", savedApplicant.getApplicantId());
            logger.info("=== SERVICE: registerCompleteApplicant END - SUCCESS ===");
            
            return savedApplicant;
        } catch (Exception e) {
            logger.error("=== SERVICE: registerCompleteApplicant END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            throw e;
        }
    }

    public Optional<Applicant> loginApplicant(String email, String password) {
        Optional<Applicant> applicant = applicantRepository.findByEmail(email);
        if (applicant.isPresent() && password.equals(applicant.get().getPassword())) {
            return applicant;
        }
        return Optional.empty();
    }

    public Optional<Applicant> findApplicantById(Long applicantId) {
        return applicantRepository.findById(applicantId);
    }

    public Applicant updateApplicant(Applicant existingApplicant, Applicant updatedApplicant) {
        if (updatedApplicant.getFirstName() != null) {
            existingApplicant.setFirstName(updatedApplicant.getFirstName());
        }
        if (updatedApplicant.getMiddleInitial() != null) {
            existingApplicant.setMiddleInitial(updatedApplicant.getMiddleInitial());
        }
        if (updatedApplicant.getLastName() != null) {
            existingApplicant.setLastName(updatedApplicant.getLastName());
        }
        if (updatedApplicant.getContactNumber() != null) {
            existingApplicant.setContactNumber(updatedApplicant.getContactNumber());
        }
        if (updatedApplicant.getAddress() != null) {
            existingApplicant.setAddress(updatedApplicant.getAddress());
        }
        if (updatedApplicant.getProfileDetails() != null) {
            existingApplicant.setProfileDetails(updatedApplicant.getProfileDetails());
        }
        if (updatedApplicant.getDateOfBirth() != null) {
            existingApplicant.setDateOfBirth(updatedApplicant.getDateOfBirth());
        }
        if (updatedApplicant.getGender() != null) {
            existingApplicant.setGender(updatedApplicant.getGender());
        }
        return applicantRepository.save(existingApplicant);
    }

    public boolean generatePasswordResetToken(String email) {
        logger.info("=== SERVICE: generatePasswordResetToken START ===");
        logger.info("Input email: '{}'", email);
        
        try {
            logger.info("Calling applicantRepository.findByEmail");
            Optional<Applicant> applicantOpt = applicantRepository.findByEmail(email);
            logger.info("Repository returned: {}", applicantOpt.isPresent() ? "Applicant found" : "No applicant found");
            
            if (applicantOpt.isPresent()) {
                Applicant applicant = applicantOpt.get();
                logger.info("Found applicant - ID: {}, Email: {}", applicant.getApplicantId(), applicant.getEmail());
                
                String token = UUID.randomUUID().toString();
                logger.info("Generated UUID token: {}", token);
                
                applicant.setPasswordResetToken(token);
                
                Calendar calendar = Calendar.getInstance();
                calendar.add(Calendar.HOUR, 1);
                Date expiryDate = calendar.getTime();
                applicant.setPasswordResetTokenExpiry(expiryDate);
                
                logger.info("Set token: {} with expiry: {}", token, expiryDate);
                
                logger.info("Saving applicant to database...");
                Applicant savedApplicant = applicantRepository.save(applicant);
                logger.info("Successfully saved. Applicant ID: {}, Token: {}, Expiry: {}", 
                           savedApplicant.getApplicantId(), 
                           savedApplicant.getPasswordResetToken(),
                           savedApplicant.getPasswordResetTokenExpiry());
                
                System.out.println("=== CONSOLE OUTPUT ===");
                System.out.println("Password reset token for " + email + ": " + token);
                System.out.println("Reset URL would be: http://localhost:3000/reset-password?token=" + token);
                System.out.println("=== END CONSOLE OUTPUT ===");
                
                logger.info("=== SERVICE: generatePasswordResetToken END - SUCCESS ===");
                return true;
            } else {
                logger.warn("=== SERVICE: generatePasswordResetToken END - NO APPLICANT FOUND ===");
                return false;
            }
        } catch (Exception e) {
            logger.error("=== SERVICE: generatePasswordResetToken END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return false;
        }
    }

    public boolean resetPassword(String token, String newPassword) {
        logger.info("=== SERVICE: resetPassword START ===");
        logger.info("Input token: '{}', password length: {}", token, newPassword.length());
        
        try {
            logger.info("Calling applicantRepository.findByPasswordResetToken");
            Optional<Applicant> applicantOpt = applicantRepository.findByPasswordResetToken(token);
            logger.info("Repository returned: {}", applicantOpt.isPresent() ? "Applicant found" : "No applicant found");
            
            if (applicantOpt.isPresent()) {
                Applicant applicant = applicantOpt.get();
                logger.info("Found applicant - ID: {}, Current token: {}", 
                           applicant.getApplicantId(), applicant.getPasswordResetToken());
                
                Date currentDate = new Date();
                Date tokenExpiry = applicant.getPasswordResetTokenExpiry();
                
                logger.info("Time validation - Current: {}, Expiry: {}", currentDate, tokenExpiry);
                logger.info("Token expiry is null: {}", tokenExpiry == null);
                if (tokenExpiry != null) {
                    logger.info("Token is after current time: {}", tokenExpiry.after(currentDate));
                    logger.info("Time difference (minutes): {}", (tokenExpiry.getTime() - currentDate.getTime()) / (1000 * 60));
                }
                
                if (tokenExpiry != null && tokenExpiry.after(currentDate)) {
                    logger.info("Token is valid. Updating password...");
                    
                    applicant.setPassword(newPassword);
                    applicant.setPasswordResetToken(null);
                    applicant.setPasswordResetTokenExpiry(null);
                    
                    logger.info("Saving updated applicant...");
                    Applicant savedApplicant = applicantRepository.save(applicant);
                    logger.info("Successfully updated applicant ID: {}", savedApplicant.getApplicantId());
                    
                    logger.info("=== SERVICE: resetPassword END - SUCCESS ===");
                    return true;
                } else {
                    logger.warn("=== SERVICE: resetPassword END - TOKEN EXPIRED ===");
                    return false;
                }
            } else {
                logger.warn("=== SERVICE: resetPassword END - NO APPLICANT FOUND ===");
                return false;
            }
        } catch (Exception e) {
            logger.error("=== SERVICE: resetPassword END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return false;
        }
    }

    public boolean validateResetToken(String token) {
        logger.info("=== SERVICE: validateResetToken START ===");
        logger.info("Input token: '{}'", token);
        
        try {
            logger.info("Calling applicantRepository.findByPasswordResetToken");
            Optional<Applicant> applicantOpt = applicantRepository.findByPasswordResetToken(token);
            logger.info("Repository returned: {}", applicantOpt.isPresent() ? "Applicant found" : "No applicant found");
            
            if (applicantOpt.isPresent()) {
                Applicant applicant = applicantOpt.get();
                Date currentDate = new Date();
                Date tokenExpiry = applicant.getPasswordResetTokenExpiry();
                
                logger.info("Found applicant ID: {} for token validation", applicant.getApplicantId());
                logger.info("Current date: {}, Token expiry: {}", currentDate, tokenExpiry);
                
                boolean isValid = tokenExpiry != null && tokenExpiry.after(currentDate);
                logger.info("Validation result: {}", isValid);
                
                logger.info("=== SERVICE: validateResetToken END - SUCCESS ===");
                return isValid;
            } else {
                logger.warn("=== SERVICE: validateResetToken END - NO APPLICANT FOUND ===");
                return false;
            }
        } catch (Exception e) {
            logger.error("=== SERVICE: validateResetToken END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return false;
        }
    }

    public boolean resetPasswordDirectly(String email, String newPassword) {
        logger.info("=== SERVICE: resetPasswordDirectly START ===");
        logger.info("Input email: '{}', password length: {}", email, newPassword.length());
        
        try {
            logger.info("Calling applicantRepository.findByEmail");
            Optional<Applicant> applicantOpt = applicantRepository.findByEmail(email);
            logger.info("Repository returned: {}", applicantOpt.isPresent() ? "Applicant found" : "No applicant found");
            
            if (applicantOpt.isPresent()) {
                Applicant applicant = applicantOpt.get();
                logger.info("Found applicant - ID: {}, Email: {}", 
                           applicant.getApplicantId(), applicant.getEmail());
                
                logger.info("Updating password directly...");
                applicant.setPassword(newPassword);
                
                // Clear any existing reset tokens
                applicant.setPasswordResetToken(null);
                applicant.setPasswordResetTokenExpiry(null);
                
                logger.info("Saving updated applicant...");
                Applicant savedApplicant = applicantRepository.save(applicant);
                logger.info("Successfully updated applicant ID: {}", savedApplicant.getApplicantId());
                
                logger.info("=== SERVICE: resetPasswordDirectly END - SUCCESS ===");
                return true;
            } else {
                logger.warn("=== SERVICE: resetPasswordDirectly END - NO APPLICANT FOUND ===");
                return false;
            }
        } catch (Exception e) {
            logger.error("=== SERVICE: resetPasswordDirectly END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return false;
        }
    }

    /**
     * Creates applicant's curriculum record from a curriculum template.
     * Each subject in the curriculum will have a corresponding ApplicantSubjectRecord
     * with blank grade, accreditation, and basis fields.
     */
    public void createApplicantRecordFromCurriculum(Applicant applicant, Curriculum curriculum) {
        logger.info("=== SERVICE: createApplicantRecordFromCurriculum START ===");
        logger.info("Creating subject records for applicant ID: {} from curriculum ID: {}", 
                   applicant.getApplicantId(), curriculum.getId());
        
        try {
            List<ApplicantSubjectRecord> subjectRecords = new ArrayList<>();
            
            // Loop through all semesters in the curriculum
            for (Semester semester : curriculum.getSemesters()) {
                logger.info("Processing semester - Year Level: {}, Semester Number: {}", 
                           semester.getYearLevel(), semester.getSemesterNumber());
                
                // Loop through all subjects in the semester
                for (Subject subject : semester.getSubjects()) {
                    logger.info("Creating record for subject: {} - {}", 
                               subject.getSubjectCode(), subject.getDescriptiveTitle());
                    
                    // Create new ApplicantSubjectRecord
                    ApplicantSubjectRecord record = new ApplicantSubjectRecord();
                    record.setApplicant(applicant);
                    record.setSubject(subject);
                    
                    // Set blank values for fields to be filled later
                    record.setGrade("");
                    record.setProcessOfAccreditation("");
                    record.setSubstantiveBasis("");
                    
                    subjectRecords.add(record);
                }
            }
            
            logger.info("Created {} subject records for applicant", subjectRecords.size());
            
            // Initialize applicant's subject records list if null
            if (applicant.getSubjectRecords() == null) {
                applicant.setSubjectRecords(new ArrayList<>());
            }
            
            // Add all new records to applicant
            applicant.getSubjectRecords().addAll(subjectRecords);
            
            // Save applicant (this will cascade and save all subject records)
            applicantRepository.save(applicant);
            
            logger.info("Successfully saved applicant with {} total subject records", 
                       applicant.getSubjectRecords().size());
            logger.info("=== SERVICE: createApplicantRecordFromCurriculum END - SUCCESS ===");
            
        } catch (Exception e) {
            logger.error("=== SERVICE: createApplicantRecordFromCurriculum END - ERROR ===");
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            throw new RuntimeException("Failed to create applicant curriculum record", e);
        }
    }
}
