package com.caps.eteeapp.repository;

import com.caps.eteeapp.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByApplicant_ApplicantId(Long applicantId);
}
