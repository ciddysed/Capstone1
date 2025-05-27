package com.caps.eteeapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.caps.eteeapp.model.Applicant;

public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    Optional<Applicant> findByEmail(String email);
    Optional<Applicant> findByPasswordResetToken(String token);
}
