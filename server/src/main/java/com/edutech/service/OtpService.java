package com.edutech.service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();

    private static final long OTP_EXPIRY_MS = 5 * 60 * 1000;

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        long expiryTime = System.currentTimeMillis() + OTP_EXPIRY_MS;

        otpStore.put(email.toLowerCase(), new OtpData(otp, expiryTime));

        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        OtpData data = otpStore.get(email.toLowerCase());

        if (data == null) {
            return false;
        }

        if (System.currentTimeMillis() > data.expiryTime) {
            otpStore.remove(email.toLowerCase());
            return false;
        }

        if (data.otp.equals(otp)) {
            otpStore.remove(email.toLowerCase());
            return true;
        }

        return false;
    }

    private static class OtpData {
        String otp;
        long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}