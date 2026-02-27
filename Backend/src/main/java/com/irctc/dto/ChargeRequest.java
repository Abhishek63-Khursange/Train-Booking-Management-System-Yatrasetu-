package com.irctc.dto;

/**
 * Simplified charge request for Stripe payments
 */
public class ChargeRequest {
    private String description;
    private Long amount; // in smallest currency unit (e.g., cents or paise)
    private String currency;
    
    // Default constructor for JSON deserialization
    public ChargeRequest() {}
    
    // Getters and Setters
    public String getDescription() {
        return description != null ? description : "IRCTC Booking";
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getAmount() {
        return amount != null ? amount : 1000L; // Default $10.00
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency != null ? currency : "usd";
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
