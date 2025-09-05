package com.caps.eteeapp.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class EvaluationService {

    public List<Object> getEvaluationsByApplicantId(Long applicantId) {
        // Implement logic to fetch evaluations for an applicant
        // This should return a list of evaluation objects with status, course info, etc.
        // For now, returning empty list as placeholder
        System.out.println("Fetching evaluations for applicant: " + applicantId);
        return new ArrayList<>();
    }

    public void forwardSingleCourseForEvaluation(Long applicantId, Long courseId, Long applicationId) {
        // Implement logic to forward a single course preference for evaluation
        // This should create evaluation records in the appropriate department
        System.out.println("Forwarding single course " + courseId + " for applicant " + applicantId + " (application: " + applicationId + ")");
        
        // Add your business logic here:
        // 1. Create evaluation record
        // 2. Notify department evaluators
        // 3. Update application status if needed
    }

    public int forwardAllCoursesForEvaluation(Long applicantId, List<Long> courseIds, Long applicationId) {
        // Implement logic to forward all course preferences for evaluation
        int forwardedCount = 0;
        
        System.out.println("Forwarding " + courseIds.size() + " courses for applicant " + applicantId + " (application: " + applicationId + ")");
        
        for (Long courseId : courseIds) {
            try {
                forwardSingleCourseForEvaluation(applicantId, courseId, applicationId);
                forwardedCount++;
                System.out.println("Successfully forwarded course " + courseId + " for applicant " + applicantId);
            } catch (Exception e) {
                System.err.println("Failed to forward course " + courseId + " for applicant " + applicantId + ": " + e.getMessage());
                // Continue with other courses even if one fails
            }
        }
        
        System.out.println("Total courses forwarded: " + forwardedCount + " out of " + courseIds.size());
        return forwardedCount;
    }
}
