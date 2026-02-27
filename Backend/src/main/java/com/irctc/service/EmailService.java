package com.irctc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.util.Base64;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${spring.mail.host}")
    private String smtpHost;
    
    @Value("${spring.mail.port}")
    private int smtpPort;

    public void sendTicketEmail(String to, String pnr, String ticketImage) throws MessagingException, IOException {
        System.out.println("\n===== Sending Email =====");
        System.out.println("From: " + fromEmail);
        System.out.println("To: " + to);
        System.out.println("SMTP Server: " + smtpHost + ":" + smtpPort);
        System.out.println("PNR: " + pnr);
        System.out.println("Ticket Image Present: " + (ticketImage != null && !ticketImage.isEmpty()));
        
        try {
            // Validate input parameters
            if (to == null || to.isBlank()) {
                throw new IllegalArgumentException("Recipient email cannot be empty");
            }
            if (pnr == null || pnr.isBlank()) {
                throw new IllegalArgumentException("PNR cannot be empty");
            }

            MimeMessage message = mailSender.createMimeMessage();
            message.setFrom(new InternetAddress(fromEmail, "Yatrasetu Support"));
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Set email properties
            helper.setTo(to.trim());
            helper.setSubject("Your Booking Confirmation for PNR: " + pnr);

            // Create email content
            String htmlContent = "<div style='font-family: Arial, sans-serif; line-height: 1.6;'>" +
                    "<h2 style='color: #1a237e;'>Booking Confirmation</h2>" +
                    "<p>Dear Valued Customer,</p>" +
                    "<p>Thank you for booking with Yatrasetu. Your e-ticket is attached to this email.</p>" +
                    "<p><strong>PNR:</strong> " + pnr + "</p>" +
                    "<p>Please find your ticket attached. You can also download it from your account.</p>" +
                    "<br>" +
                    "<p>Safe travels!</p>" +
                    "<p><strong>The Yatrasetu Team</strong></p>" +
                    "</div>";

            helper.setText(htmlContent, true);

            // Handle ticket image attachment if provided
            if (ticketImage != null && !ticketImage.isBlank()) {
                try {
                    // Handle different base64 formats (with or without data:image prefix)
                    String base64Image = ticketImage;
                    if (ticketImage.contains(",")) {
                        base64Image = ticketImage.split(",")[1];
                    }
                    
                    // Decode the base64 image
                    byte[] imageBytes = Base64.getDecoder().decode(base64Image.trim());
                    
                    // Add the image as an attachment
                    helper.addAttachment("ticket-" + pnr + ".png", 
                                      new ByteArrayResource(imageBytes), 
                                      "image/png");
                } catch (Exception e) {
                    System.err.println("Error attaching ticket image: " + e.getMessage());
                    // Continue without the attachment rather than failing the entire email
                }
            }

            // Send the email
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
            
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            throw new MessagingException("Failed to send email: " + e.getMessage(), e);
        }
    }

    public void sendRegistrationEmail(String to, String username) throws MessagingException {
        System.out.println("\n===== Sending Registration Email =====");
        System.out.println("From: " + fromEmail);
        System.out.println("To: " + to);
        System.out.println("Username: " + username);
        
        try {
            // Validate input parameters
            if (to == null || to.isBlank()) {
                throw new IllegalArgumentException("Recipient email cannot be empty");
            }
            if (username == null || username.isBlank()) {
                throw new IllegalArgumentException("Username cannot be empty");
            }

            MimeMessage message = mailSender.createMimeMessage();
            message.setFrom(new InternetAddress(fromEmail, "Yatrasetu Support"));
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Set email properties
            helper.setTo(to.trim());
            helper.setSubject("Welcome to Yatrasetu - Registration Successful!");

            // Create email content
            String htmlContent = "<div style='font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;'>" +
                    "<div style='background: linear-gradient(135deg, #1a237e 0%, #2c3e50 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;'>" +
                    "<h1 style='margin: 0; font-size: 28px;'>🚂 Welcome to Yatrasetu!</h1>" +
                    "<p style='margin: 10px 0 0 0; opacity: 0.9;'>Your Journey Begins Here</p>" +
                    "</div>" +
                    
                    "<div style='background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;'>" +
                    
                    "<h2 style='color: #1a237e; margin-top: 0;'>Dear " + username + ",</h2>" +
                    
                    "<p style='color: #333; font-size: 16px;'>Thank you for registering with <strong>Yatrasetu</strong>! Your account has been successfully created.</p>" +
                    
                    "<div style='background: #f8f9fa; padding: 20px; border-left: 4px solid #1a237e; margin: 20px 0; border-radius: 5px;'>" +
                    "<h3 style='color: #1a237e; margin-top: 0;'>🎉 What's Next?</h3>" +
                    "<ul style='color: #555; line-height: 1.8;'>" +
                    "<li>🔍 Search trains between any stations in India</li>" +
                    "<li>🎫 Book tickets with secure payment options</li>" +
                    "<li>📱 Track your bookings with PNR status</li>" +
                    "<li>📧 Receive instant booking confirmations</li>" +
                    "<li>🚆 Manage your travel plans easily</li>" +
                    "</ul>" +
                    "</div>" +
                    
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='http://localhost:3001/login' style='background: #1a237e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Login to Your Account</a>" +
                    "</div>" +
                    
                    "<div style='background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                    "<p style='margin: 0; color: #856404;'><strong>📧 Keep this email safe!</strong> It contains your account information.</p>" +
                    "</div>" +
                    
                    "<div style='border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;'>" +
                    "<h4 style='color: #1a237e; margin-top: 0;'>Need Help?</h4>" +
                    "<p style='color: #666;'>Our support team is here to assist you:</p>" +
                    "<ul style='color: #666;'>" +
                    "<li>📧 Email: support@yatrasetu.com</li>" +
                    "<li>📞 Phone: 1800-123-4567 (24/7)</li>" +
                    "<li>💬 Live Chat: Available on our website</li>" +
                    "</ul>" +
                    "</div>" +
                    
                    "<div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;'>" +
                    "<p style='color: #999; margin: 0; font-size: 14px;'>This is an automated message. Please do not reply to this email.</p>" +
                    "<p style='color: #999; margin: 10px 0 0 0; font-size: 14px;'>© 2024 Yatrasetu. All rights reserved.</p>" +
                    "</div>" +
                    
                    "</div>" +
                    "</div>";

            helper.setText(htmlContent, true);

            // Send the email
            mailSender.send(message);
            System.out.println("Registration email sent successfully to: " + to);
            
        } catch (Exception e) {
            System.err.println("Failed to send registration email: " + e.getMessage());
            throw new MessagingException("Failed to send registration email: " + e.getMessage(), e);
        }
    }

    public void sendCustomEmail(String to, String subject, String htmlContent) throws MessagingException {
        System.out.println("\n===== Sending Custom Email =====");
        System.out.println("From: " + fromEmail);
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        
        try {
            // Validate input parameters
            if (to == null || to.isBlank()) {
                throw new IllegalArgumentException("Recipient email cannot be empty");
            }
            if (subject == null || subject.isBlank()) {
                throw new IllegalArgumentException("Subject cannot be empty");
            }
            if (htmlContent == null || htmlContent.isBlank()) {
                throw new IllegalArgumentException("Email content cannot be empty");
            }

            MimeMessage message = mailSender.createMimeMessage();
            message.setFrom(new InternetAddress(fromEmail, "Yatrasetu Support"));
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Set email properties
            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Send the email
            mailSender.send(message);
            System.out.println("Custom email sent successfully to: " + to);
            
        } catch (Exception e) {
            System.err.println("Failed to send custom email: " + e.getMessage());
            throw new MessagingException("Failed to send custom email: " + e.getMessage(), e);
        }
    }
}
