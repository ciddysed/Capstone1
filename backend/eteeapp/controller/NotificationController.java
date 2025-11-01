package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.Notification;
import com.caps.eteeapp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long applicantId) {
        List<Notification> list = notificationService.getNotificationsForApplicant(applicantId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/applicant/{applicantId}/unread")
    public ResponseEntity<List<Notification>> getUnread(@PathVariable Long applicantId) {
        List<Notification> list = notificationService.getUnreadNotificationsForApplicant(applicantId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Notification payload) {
        if (payload == null || payload.getApplicant() == null) return ResponseEntity.badRequest().build();
        Notification.NotificationType type = payload.getType();
        String clientTempId = payload.getClientTempId();
        Notification created = notificationService.createNotification(
                payload.getApplicant().getApplicantId(), payload.getTitle(), payload.getMessage(), type, clientTempId);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        boolean ok = notificationService.markAsRead(id);
        return ok ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/applicant/{applicantId}/read-all")
    public ResponseEntity<?> markAllRead(@PathVariable Long applicantId) {
        notificationService.markAllAsRead(applicantId);
        return ResponseEntity.ok().build();
    }
}
