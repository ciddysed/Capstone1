package com.caps.eteeapp.repository;

import com.caps.eteeapp.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByApplicant_ApplicantIdOrderByCreatedAtDesc(Long applicantId);

    List<Notification> findByApplicant_ApplicantIdAndReadFalseOrderByCreatedAtDesc(Long applicantId);
}
