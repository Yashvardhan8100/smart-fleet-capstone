package com.edutech.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.dto.ContactRequest;
import com.edutech.service.EmailService;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> sendContact(@RequestBody ContactRequest request) {

        try {
            System.out.println("✅ Contact API triggered");

            emailService.sendContactEmail(
                    request.getName(),
                    request.getEmail(),
                    request.getMessage());

            return ResponseEntity.ok().body(java.util.Map.of(
                    "status", "success",
                    "message", "Message sent successfully"));

        } catch (Exception e) {
            e.printStackTrace(); // ✅ VERY IMPORTANT (shows real error in console)

            return ResponseEntity.status(500)
                    .body("❌ Email sending failed: " + e.getMessage());
        }
    }
}
