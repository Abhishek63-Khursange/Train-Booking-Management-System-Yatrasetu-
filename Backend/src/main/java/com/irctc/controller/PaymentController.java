package com.irctc.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.irctc.dto.ChargeRequest;
import com.irctc.service.BookingService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payment")
public class PaymentController {
    
        @Value("${stripe.api.secretkey}")
    private String secretKey;
    
    private final BookingService bookingService;

    @PostConstruct
    public void init() {
        // Simple initialization with the key from properties
        Stripe.apiKey = secretKey;
        log.info("Stripe API key initialized");
    }
@PostMapping("/checkout")
public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> request) {
    try {
        log.info("Payment checkout request received: {}", request);
        
        // Simple validation
        if (request == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Request cannot be empty"));
        }
        
        // Required parameters with defaults
        Long amount = request.get("amount") != null ? 
            Long.parseLong(request.get("amount").toString()) : 1000L; // $10.00
            
        String currency = request.get("currency") != null ? 
            request.get("currency").toString() : "usd";
            
        String description = request.get("description") != null ? 
            request.get("description").toString() : "IRCTC Booking";
            
        // Get success and cancel URLs from request
        String successUrl = request.get("success_url") != null ? 
            request.get("success_url").toString() : 
            "http://localhost:3000/booking/confirmation?payment_success=true";
            
        String cancelUrl = request.get("cancel_url") != null ? 
            request.get("cancel_url").toString() : 
            "http://localhost:3000/booking/cancel";
        
        log.info("Processing payment: amount={}, currency={}, description={}", amount, currency, description);
        
        // Create a simple Stripe Checkout session
        SessionCreateParams params = SessionCreateParams.builder()
            .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl(successUrl)
            .setCancelUrl(cancelUrl)
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setQuantity(1L)
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency(currency)
                            .setUnitAmount(amount)
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(description)
                                    .build())
                            .build())
                    .build())
            .build();
        
        // Create the session
        Session session = Session.create(params);
        
        log.info("Stripe session created successfully: {}", session.getId());
        
        // Return the session URL to redirect the user to Stripe Checkout
        return ResponseEntity.ok(Map.of(
            "url", session.getUrl()
        ));
        
    } catch (Exception e) {
        log.error("Payment error: {}", e.getMessage(), e);
        return ResponseEntity.status(500).body(Map.of(
            "error", "Payment processing failed",
            "message", e.getMessage()
        ));
    }
}

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                fieldError -> fieldError.getDefaultMessage() != null ? 
                    fieldError.getDefaultMessage() : "Invalid value"
            ));
            
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "error", "Validation failed",
            "errors", errors
        ));
    }

    
    /**
     * Get the current authenticated user's ID
     * @return The user ID as a String, or null if not authenticated
     */
    private String getCurrentUserId() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(Authentication::getName)
                .orElse(null);
    }
}