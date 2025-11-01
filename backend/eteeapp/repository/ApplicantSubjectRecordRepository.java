package com.caps.eteeapp.repository;

import com.caps.eteeapp.model.ApplicantSubjectRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicantSubjectRecordRepository extends JpaRepository<ApplicantSubjectRecord, Long> {
    
    List<ApplicantSubjectRecord> findByApplicant_ApplicantId(Long applicantId);
    
    List<ApplicantSubjectRecord> findBySubject_Id(Long subjectId);
    
    List<ApplicantSubjectRecord> findByApplicant_ApplicantIdAndSubject_Semester_YearLevel(Long applicantId, Integer yearLevel);
    
    List<ApplicantSubjectRecord> findByStatus(ApplicantSubjectRecord.RecordStatus status);
    
    List<ApplicantSubjectRecord> findByApplicant_ApplicantIdAndStatus(Long applicantId, ApplicantSubjectRecord.RecordStatus status);
}
