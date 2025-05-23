package com.caps.eteeapp.controller;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.caps.eteeapp.model.Document;
import com.caps.eteeapp.model.FileResponse;
import com.caps.eteeapp.service.DocumentService;

import jakarta.servlet.http.HttpServletRequest;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocuments(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("applicantId") Long applicantId,
            @RequestParam("documentType") String documentType) {

        if (files.length == 0) {
            return ResponseEntity.badRequest().body("No files were uploaded");
        }

        for (MultipartFile file : files) {
            if (file.getSize() > 15 * 1024 * 1024) { // 15MB in bytes
                return ResponseEntity.badRequest().body("One or more files exceed the limit of 15MB");
            }
        }

        List<FileResponse> responses = Arrays.stream(files)
                .map(file -> {
                    Document document = documentService.uploadDocument(applicantId, documentType, file);
                    String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                            .path("/api/documents/")
                            .path(document.getDocumentId().toString())
                            .toUriString();

                    return FileResponse.fromDocument(document, fileDownloadUri);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(files.length == 1 ? responses.get(0) : responses);
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<Document>> getDocumentsByApplicantId(@PathVariable Long applicantId) {
        List<Document> documents = documentService.getDocumentsByApplicantId(applicantId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id, HttpServletRequest request) {
        Resource resource = documentService.getDocumentFile(id);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id, HttpServletRequest request) {
        Resource resource = documentService.getDocumentFile(id);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // Add new endpoint for previewing documents in browser
    @GetMapping("/preview/{id}")
    public ResponseEntity<Resource> previewDocument(@PathVariable Long id, HttpServletRequest request) {
        Resource resource = documentService.getDocumentFile(id);
        Document document = documentService.getDocumentById(id);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // If we can't determine content type, try to infer from file extension
            String fileName = document.getFileName().toLowerCase();
            if (fileName.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (fileName.endsWith(".png")) {
                contentType = "image/png";
            } else if (fileName.endsWith(".gif")) {
                contentType = "image/gif";
            }
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        // Key difference from download: we use "inline" instead of "attachment" to preview in browser
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}