package com.caps.eteeapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.caps.eteeapp.model.ProgramAdmin;

public interface ProgramAdminRepository extends JpaRepository<ProgramAdmin, Long> {
    // Find program admin by email for login
    Optional<ProgramAdmin> findByEmail(String email);
    
    // Additional query methods can be added here if needed
}
