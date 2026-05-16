package com.edutech.service;

import java.util.Collections;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.edutech.entity.User;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ MODIFIED — Now accepts username OR email for login
    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail)
            throws UsernameNotFoundException {

        Optional<User> user = userRepository.findByUsername(usernameOrEmail);

        // If not found by username, try email
        if (user.isEmpty()) {
            user = userRepository.findByEmail(usernameOrEmail);
        }

        if (user.isEmpty()) {
            throw new UsernameNotFoundException(
                    "User not found with username or email: " + usernameOrEmail);
        }

        User foundUser = user.get();

        return new org.springframework.security.core.userdetails.User(
                foundUser.getUsername(),
                foundUser.getPassword(),
                Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + foundUser.getRole().name())));
    }

    // Find user by username
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // Check if username exists
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    // Save user
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Register new user with encoded password
    public User registerUser(User user) {
        if (existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        user.setPassword(
                passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Check if email exists
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // Check if contact number exists
    public boolean existsByContactNumber(Long contactNumber) {
        return userRepository.existsByContactNumber(contactNumber);
    }

    // ✅ NEW — Find user by email (for forgot password)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account found with email: " + email));
    }

    // ✅ NEW — Reset password
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account found with email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}