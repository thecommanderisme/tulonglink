package com.tulonglink.backend.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;

@Service
public class OtpService {

    private final StringRedisTemplate redisTemplate;

    // OTP expires after 5 minutes
    private static final Duration OTP_EXPIRY = Duration.ofMinutes(5);
    private static final String OTP_PREFIX = "otp:";

    public OtpService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Generate and store OTP
    public String generateOtp(String phone) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        redisTemplate.opsForValue().set(OTP_PREFIX + phone, otp, OTP_EXPIRY);
        return otp;
    }

    // Verify OTP
    public boolean verifyOtp(String phone, String otp) {
        String stored = redisTemplate.opsForValue().get(OTP_PREFIX + phone);
        if (stored == null || !stored.equals(otp)) {
            return false;
        }
        // Delete after successful verification
        redisTemplate.delete(OTP_PREFIX + phone);
        return true;
    }

    // Check if OTP exists
    public boolean hasOtp(String phone) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(OTP_PREFIX + phone));
    }
}