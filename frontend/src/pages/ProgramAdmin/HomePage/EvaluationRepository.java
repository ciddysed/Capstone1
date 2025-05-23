package com.caps.eteeapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.caps.eteeapp.model.Evaluation;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    // Find evaluations by evaluator ID using correct method naming
    List<Evaluation> findByEvaluator_EvaluatorId(Long evaluatorId);
    
    // Find evaluations by applicant ID using correct method naming
    List<Evaluation> findByApplicant_ApplicantId(Long applicantId);
    
    // Find by evaluation status
    List<Evaluation> findByEvaluationStatus(Evaluation.EvaluationStatus status);
    
    // Find specific evaluation by applicant, course, and evaluator IDs
    Optional<Evaluation> findByApplicant_ApplicantIdAndCourse_CourseIdAndEvaluator_EvaluatorId(
        Long applicantId, Long courseId, Long evaluatorId);
        
    // Add new method to find by applicant ID and course ID
    Optional<Evaluation> findByApplicant_ApplicantIdAndCourse_CourseId(
        Long applicantId, Long courseId);
}
