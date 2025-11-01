package com.caps.eteeapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.caps.eteeapp.model.ApplicantApplication;

public interface ApplicantApplicationRepository extends JpaRepository<ApplicantApplication, Long> {
    List<ApplicantApplication> findByApplicant_ApplicantId(Long applicantId);
}
