package com.caps.eteeapp.repository;

import com.caps.eteeapp.model.AcceptedApplicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcceptedApplicantRepository extends JpaRepository<AcceptedApplicant, Long> {
    
    List<AcceptedApplicant> findByApplicant_ApplicantId(Long applicantId);
    
    List<AcceptedApplicant> findByFinalCourse_CourseId(Long courseId);
    
    List<AcceptedApplicant> findByStatus(AcceptedApplicant.AcceptanceStatus status);
    
    Optional<AcceptedApplicant> findByApplicant_ApplicantIdAndFinalCourse_CourseId(Long applicantId, Long courseId);
    
    boolean existsByApplicant_ApplicantId(Long applicantId);
}
