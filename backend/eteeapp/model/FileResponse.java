package com.caps.eteeapp.model;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class FileResponse {
    // Document database information
    private Long documentId;
    private Long applicantId; // Changed from applicationId to applicantId
    private String documentType;
    private Date uploadDate;

    // File information
    private String fileName;
    private String fileType;
    private long fileSize;
    private String readableFileSize;

    // Access information
    private String downloadUrl;
    private String message;

    public static FileResponse fromDocument(Document document, String downloadUrl) {
        return FileResponse.builder()
                .documentId(document.getDocumentId())
                .applicantId(document.getApplicant().getApplicantId()) // Updated to use applicantId
                .documentType(document.getDocumentType().name()) // Convert enum to String
                .uploadDate(document.getUploadDate())
                .fileName(document.getFileName())
                .fileType(document.getFileType())
                .fileSize(document.getFileSize())
                .readableFileSize(formatFileSize(document.getFileSize()))
                .downloadUrl(downloadUrl)
                .message("File uploaded successfully")
                .build();
    }

    private static String formatFileSize(long size) {
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.2f KB", size / 1024.0);
        } else if (size < 1024 * 1024 * 1024) {
            return String.format("%.2f MB", size / (1024.0 * 1024));
        } else {
            return String.format("%.2f GB", size / (1024.0 * 1024 * 1024));
        }
    }
}