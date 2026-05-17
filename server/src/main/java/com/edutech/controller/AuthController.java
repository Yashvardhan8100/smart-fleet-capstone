package com.edutech.controller;

import java.util.HashMap;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.edutech.dto.LoginRequest;
import com.edutech.dto.LoginResponse;
import com.edutech.entity.User;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.service.EmailService;
import com.edutech.service.OtpService;
import com.edutech.service.UserService;
import com.edutech.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User registered = userService.registerUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "User registered successfully",
                            "data", registered));

        } catch (RuntimeException e) {

            // ✅ ✅ CLEAN VALIDATION RESPONSE
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User authRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            // ✅ FIX — Resolve email to username before authenticating
            String actualUsername = authRequest.getUsername();

            // Check if input is an email (contains @)
            if (actualUsername != null && actualUsername.contains("@")) {
                try {
                    User userByEmail = userService.findByEmail(actualUsername);
                    actualUsername = userByEmail.getUsername();
                } catch (Exception e) {
                    response.put("message", "No account found with this email.");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            }

            // Authenticate with actual username
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            actualUsername,
                            authRequest.getPassword()));

            // Load user details and generate token
            UserDetails userDetails = userService.loadUserByUsername(actualUsername);
            String token = jwtUtil.generateToken(userDetails.getUsername());

            // Get user role
            User user = userService.findByUsername(actualUsername);

            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("role", user.getRole().name());

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            response.put("message", "Invalid username/email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // GET /api/auth/user
    @GetMapping("/user")
    public ResponseEntity<?> getUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        User user = userService.findByUsername(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    // ✅ NEW — Check if username is already taken
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean exists = userService.existsByUsername(username);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    // ✅ NEW — Check if email is already registered
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    // ✅ NEW — Check if contact number is already registered
    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhone(@RequestParam Long contactNumber) {
        boolean exists = userService.existsByContactNumber(contactNumber);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    // ✅ NEW — Send OTP to email
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        try {
            String otp = otpService.generateOtp(email);
            emailService.sendOtpEmail(email, otp);

            response.put("success", true);
            response.put("message", "OTP sent to " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send OTP: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ NEW — Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestParam String email,
            @RequestParam String otp) {

        Map<String, Object> response = new HashMap<>();

        boolean isValid = otpService.verifyOtp(email, otp);

        response.put("verified", isValid);
        response.put("message", isValid ? "Email verified successfully!" : "Invalid or expired OTP.");

        return ResponseEntity.ok(response);
    }

    // ✅ NEW — Forgot Password: Send OTP
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> forgotPasswordSendOtp(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Check if email exists
            userService.findByEmail(email);

            String otp = otpService.generateOtp(email);
            emailService.sendOtpEmail(email, otp);

            response.put("success", true);
            response.put("message", "OTP sent to " + email);
            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            response.put("success", false);
            response.put("message", "No account found with this email.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send OTP: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ NEW — Forgot Password: Verify OTP
    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> forgotPasswordVerifyOtp(
            @RequestParam String email,
            @RequestParam String otp) {

        Map<String, Object> response = new HashMap<>();

        boolean isValid = otpService.verifyOtp(email, otp);

        response.put("verified", isValid);
        response.put("message", isValid
                ? "OTP verified. You can now reset your password."
                : "Invalid or expired OTP.");

        return ResponseEntity.ok(response);
    }

    // ✅ NEW — Forgot Password: Reset Password
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(
            @RequestParam String email,
            @RequestParam String newPassword) {

        Map<String, Object> response = new HashMap<>();

        try {
            userService.resetPassword(email, newPassword);

            response.put("success", true);
            response.put("message", "Password reset successfully!");
            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to reset password.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
