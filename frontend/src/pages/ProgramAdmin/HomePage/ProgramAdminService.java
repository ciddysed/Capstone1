package com.caps.eteeapp.service;

import com.caps.eteeapp.model.ProgramAdmin;
import com.caps.eteeapp.repository.ProgramAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProgramAdminService {

    @Autowired
    private ProgramAdminRepository programAdminRepository;

    public ProgramAdmin createProgramAdmin(ProgramAdmin programAdmin) {
        return programAdminRepository.save(programAdmin);
    }

    public List<ProgramAdmin> getAllProgramAdmins() {
        return programAdminRepository.findAll();
    }

    public Optional<ProgramAdmin> getProgramAdminById(Long id) {
        return programAdminRepository.findById(id);
    }

    public ProgramAdmin updateProgramAdmin(Long id, ProgramAdmin updatedProgramAdmin) {
        return programAdminRepository.findById(id).map(admin -> {
            admin.setName(updatedProgramAdmin.getName());
            admin.setEmail(updatedProgramAdmin.getEmail());
            admin.setContactNumber(updatedProgramAdmin.getContactNumber());
            admin.setRole(updatedProgramAdmin.getRole());
            admin.setPassword(updatedProgramAdmin.getPassword());
            return programAdminRepository.save(admin);
        }).orElseThrow(() -> new RuntimeException("ProgramAdmin not found with id " + id));
    }

    public void deleteProgramAdmin(Long id) {
        programAdminRepository.deleteById(id);
    }
}
