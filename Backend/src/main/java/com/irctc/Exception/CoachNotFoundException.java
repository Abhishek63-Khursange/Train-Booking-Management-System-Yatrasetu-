package com.irctc.Exception;

public class CoachNotFoundException extends RuntimeException {
    public CoachNotFoundException(String message) {
        super(message);
    }
}