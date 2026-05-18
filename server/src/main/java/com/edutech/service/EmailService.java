package com.edutech.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // ✅ OTP EMAIL (FIXED: added setTo)
    public void sendOtpEmail(String toEmail, String otp) {

        try {
            System.out.println("✅ Sending OTP email...");

            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(toEmail); // ✅ IMPORTANT (was missing in your code)
            message.setSubject("SmartFleet Pro - Email Verification OTP");

            message.setText(
                    "Hello,\n\n" +
                    "Your OTP for SmartFleet Pro registration is: " + otp + "\n\n" +
                    "This OTP is valid for 5 minutes.\n" +
                    "Do not share this code with anyone.\n\n" +
                    "— SmartFleet Pro Team"
            );

            mailSender.send(message);

            System.out.println("✅ OTP EMAIL SENT SUCCESSFULLY");

        } catch (Exception e) {
            System.out.println("❌ OTP EMAIL FAILED");
            e.printStackTrace();
            throw e;
        }
    }

    // ✅ CONTACT EMAIL (FINAL FIXED VERSION)
    public void sendContactEmail(String name, String email, String messageText) {

        try {
            System.out.println("✅ Sending contact email...");

            SimpleMailMessage message = new SimpleMailMessage();

            // ✅ Use same Gmail for testing (guaranteed to work)
            message.setTo("smartfleetpro.project@gmail.com");

            message.setSubject("New Contact Message - SmartFleet Pro");

            message.setText(
                    " New Contact Form Submission\n\n" +
                    " Name: " + name + "\n" +
                    "User Email: " + email + "\n\n" +
                    "Message:\n" + messageText + "\n\n" +
                    "— Sent from SmartFleet Website"
            );

            // ❌ DO NOT USE replyTo (causes failure in many cases)
            // message.setReplyTo(email);

            mailSender.send(message);

            System.out.println("✅ CONTACT EMAIL SENT SUCCESSFULLY");

        } catch (Exception e) {
            System.out.println("❌ CONTACT EMAIL FAILED");
            e.printStackTrace(); // ✅ prints exact error
            throw e;
        }
    }
}