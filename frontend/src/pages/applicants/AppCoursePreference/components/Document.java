package com.caps.eteeapp.model;

import jakarta.persistence.*;
import java.util.Date;
import lombok.Data;

@Data
@Entity
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long documentId;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false) // Reference applicantId instead of applicationId
    private Applicant applicant;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    private String filePath;

    @Temporal(TemporalType.TIMESTAMP)
    private Date uploadDate;

    private String fileName;

    private String fileType;

    private Long fileSize;

}