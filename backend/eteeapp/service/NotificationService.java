package com.caps.eteeapp.service;

import com.caps.eteeapp.model.Applicant;
import com.caps.eteeapp.model.Notification;
import com.caps.eteeapp.repository.ApplicantRepository;
import com.caps.eteeapp.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    public Notification createNotification(Long applicantId, String title, String message, Notification.NotificationType type, String clientTempId) {
        Applicant applicant = applicantRepository.findById(applicantId).orElse(null);
        if (applicant == null) return null;

        Notification notification = new Notification();
        notification.setApplicant(applicant);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setClientTempId(clientTempId);
        notification.setType(type != null ? type : Notification.NotificationType.INFO);
        notification.setCreatedAt(new Date());
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForApplicant(Long applicantId) {
        return notificationRepository.findByApplicant_ApplicantIdOrderByCreatedAtDesc(applicantId);
    }

    public List<Notification> getUnreadNotificationsForApplicant(Long applicantId) {
        return notificationRepository.findByApplicant_ApplicantIdAndReadFalseOrderByCreatedAtDesc(applicantId);
    }

    public boolean markAsRead(Long notificationId) {
        return notificationRepository.findById(notificationId).map(n -> {
            n.setRead(true);
            notificationRepository.save(n);
            return true;
        }).orElse(false);
    }

    public boolean markAllAsRead(Long applicantId) {
        List<Notification> list = notificationRepository.findByApplicant_ApplicantIdOrderByCreatedAtDesc(applicantId);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
        return true;
    }
}
