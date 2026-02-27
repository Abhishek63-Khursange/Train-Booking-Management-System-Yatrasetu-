package com.irctc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
public class OtpService {

    @Autowired
    private EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int OTP_LENGTH = 6;
    
    // In-memory storage for OTP (instead of Redis)
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    public String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    public void sendOtp(String email, String username) throws Exception {
        // Generate OTP
        String otp = generateOtp();
        
        // Store OTP in memory with expiry
        OtpData otpData = new OtpData(otp, System.currentTimeMillis() + (OTP_EXPIRY_MINUTES * 60 * 1000));
        otpStorage.put(email, otpData);
        
        // Send OTP email
        sendOtpEmail(email, username, otp);
        
        System.out.println("OTP sent to email: " + email + " | OTP: " + otp);
    }

    public boolean verifyOtp(String email, String inputOtp) {
        OtpData storedData = otpStorage.get(email);
        
        if (storedData == null) {
            System.out.println("OTP not found for email: " + email);
            return false;
        }
        
        // Check if OTP expired
        if (System.currentTimeMillis() > storedData.expiryTime) {
            otpStorage.remove(email);
            System.out.println("OTP expired for email: " + email);
            return false;
        }
        
        boolean isValid = storedData.otp.equals(inputOtp);
        
        if (isValid) {
            // Delete OTP after successful verification
            otpStorage.remove(email);
            System.out.println("OTP verified successfully for email: " + email);
        } else {
            System.out.println("Invalid OTP for email: " + email);
        }
        
        return isValid;
    }

    private void sendOtpEmail(String email, String username, String otp) throws Exception {
        String subject = "Yatrasetu - Verify Your Email (OTP: " + otp + ")";
        
        String htmlContent = "<div style='font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;'>" +
                "<div style='background: linear-gradient(135deg, #1a237e 0%, #2c3e50 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>" +
                "<h1 style='margin: 0; font-size: 28px;'>🔐 Email Verification</h1>" +
                "<p style='margin: 10px 0 0 0; opacity: 0.9;'>Complete Your Registration</p>" +
                "</div>" +
                
                "<div style='background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;'>" +
                
                "<h2 style='color: #1a237e; margin-top: 0;'>Hi " + username + ",</h2>" +
                
                "<p style='color: #333; font-size: 16px;'>Thank you for signing up with <strong>Yatrasetu</strong>! To complete your registration, please use the OTP below:</p>" +
                
                "<div style='background: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px; margin: 25px 0; border: 2px dashed #1a237e;'>" +
                "<h3 style='color: #1a237e; margin: 0 0 10px 0; font-size: 18px;'>Your Verification Code</h3>" +
                "<div style='font-size: 32px; font-weight: bold; color: #1a237e; letter-spacing: 5px; background: white; padding: 15px; border-radius: 5px; display: inline-block;'>" + otp + "</div>" +
                "</div>" +
                
                "<div style='background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                "<p style='margin: 0; color: #856404;'><strong>⏰ Important:</strong> This OTP will expire in <strong>5 minutes</strong></p>" +
                "</div>" +
                
                "<div style='background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                "<h4 style='color: #0066cc; margin-top: 0;'>📝 How to use this OTP:</h4>" +
                "<ol style='color: #555; line-height: 1.8;'>" +
                "<li>Return to the registration page</li>" +
                "<li>Enter this OTP in the verification field</li>" +
                "<li>Click 'Verify & Register' button</li>" +
                "<li>Your account will be created instantly!</li>" +
                "</ol>" +
                "</div>" +
                
                "<div style='text-align: center; margin: 25px 0;'>" +
                "<p style='color: #666; font-size: 14px;'>If you didn't request this OTP, please ignore this email.</p>" +
                "</div>" +
                
                "<div style='border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 25px;'>" +
                "<h4 style='color: #1a237e; margin-top: 0;'>Need Help?</h4>" +
                "<p style='color: #666;'>Contact our support team:</p>" +
                "<ul style='color: #666;'>" +
                "<li>📧 Email: support@yatrasetu.com</li>" +
                "<li>📞 Phone: 1800-123-4567 (24/7)</li>" +
                "</ul>" +
                "</div>" +
                
                "<div style='text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0;'>" +
                "<p style='color: #999; margin: 0; font-size: 14px;'>This is an automated message. Please do not reply to this email.</p>" +
                "<p style='color: #999; margin: 10px 0 0 0; font-size: 14px;'>© 2024 Yatrasetu. All rights reserved.</p>" +
                "</div>" +
                
                "</div>" +
                "</div>";

        emailService.sendCustomEmail(email, subject, htmlContent);
    }

    // Inner class to store OTP with expiry time
    private static class OtpData {
        final String otp;
        final long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}
