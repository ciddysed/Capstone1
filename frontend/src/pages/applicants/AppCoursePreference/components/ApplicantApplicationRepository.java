package com.caps.eteeapp.repository;

import com.caps.eteeapp.model.ApplicantApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicantApplicationRepository extends JpaRepository<ApplicantApplication, Long> {
    List<ApplicantApplication> findByApplicant_ApplicantId(Long applicantId);
}
