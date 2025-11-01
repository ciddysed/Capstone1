package com.caps.eteeapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.caps.eteeapp.model.ApplicationCoursePreference;

@Repository
public interface ApplicationCoursePreferenceRepository extends JpaRepository<ApplicationCoursePreference, Long> {

    // Find preferences by applicant ID using correct method naming
    List<ApplicationCoursePreference> findByApplicant_ApplicantId(Long applicantId);
}
