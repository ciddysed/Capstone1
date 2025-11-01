package com.caps.eteeapp.service;

import com.caps.eteeapp.model.Applicant;
import com.caps.eteeapp.model.Document;
import com.caps.eteeapp.model.DocumentType;
import com.caps.eteeapp.repository.ApplicantRepository;
import com.caps.eteeapp.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<Document> getDocumentsByApplicantId(Long applicantId) {
        return documentRepository.findByApplicant_ApplicantId(applicantId);
    }

    public Document uploadDocument(Long applicantId, String documentType, MultipartFile file) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        if (!applicantOpt.isPresent()) {
            throw new RuntimeException("Applicant not found with id " + applicantId);
        }

        String fileName = fileStorageService.storeFile(file);

        Document document = new Document();
        document.setApplicant(applicantOpt.get());
        document.setDocumentType(DocumentType.valueOf(documentType)); // Use enum
        document.setFilePath(fileName);
        document.setFileName(file.getOriginalFilename());
        document.setUploadDate(new Date());
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setVerified(false); // Default to not verified
        document.setNotes(null); // Default to no notes

        return documentRepository.save(document);
    }

    public Resource getDocumentFile(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + documentId));

        return fileStorageService.loadFileAsResource(document.getFilePath());
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + id));
    }

    public void deleteDocument(Long documentId) {
        documentRepository.deleteById(documentId);
    }

    public Document updateDocument(Long documentId, Long applicantId, String documentType, MultipartFile file) {
        Document existingDocument = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + documentId));
        
        // Replace the file directly by reusing the same path
        String filePath = existingDocument.getFilePath();
        try {
            // Store the new file overwriting the old one
            fileStorageService.replaceFile(filePath, file);
        } catch (Exception e) {
            // If replacing fails, store as a new file
            filePath = fileStorageService.storeFile(file);
        }
        
        // Update the document properties
        existingDocument.setFilePath(filePath);
        existingDocument.setFileName(file.getOriginalFilename());
        existingDocument.setUploadDate(new Date());
        existingDocument.setFileType(file.getContentType());
        existingDocument.setFileSize(file.getSize());
        
        // Update document type if provided
        if (documentType != null && !documentType.isEmpty()) {
            existingDocument.setDocumentType(DocumentType.valueOf(documentType));
        }
        
        // Keep existing verification status and notes unless specifically updated
        // (These would be updated through separate admin endpoints)
        
        // We don't need to update applicant as it should remain the same
        // Just verify if provided
        if (applicantId != null) {
            if (!existingDocument.getApplicant().getApplicantId().equals(applicantId)) {
                throw new RuntimeException("Cannot change document ownership during update");
            }
        }
        
        return documentRepository.save(existingDocument);
    }

    // Add method to update verification status and notes
    public Document updateDocumentVerification(Long documentId, Boolean verified, String notes) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + documentId));
        
        if (verified != null) {
            document.setVerified(verified);
        }
        
        if (notes != null) {
            document.setNotes(notes);
        }
        
        return documentRepository.save(document);
    }
}