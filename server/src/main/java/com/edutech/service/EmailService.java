package com.edutech.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("SmartFleet Pro - Email Verification OTP");
        message.setText(
                "Hello,\n\n" +
                        "Your OTP for SmartFleet Pro registration is: " + otp + "\n\n" +
                        "This OTP is valid for 5 minutes.\n" +
                        "Do not share this code with anyone.\n\n" +
                        "— SmartFleet Pro Team");

        mailSender.send(message);
    }
}