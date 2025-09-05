package com.caps.eteeapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.caps.eteeapp.model.ProgramAdmin;

public interface ProgramAdminRepository extends JpaRepository<ProgramAdmin, Long> {
    // Additional query methods can be added here if needed
}
