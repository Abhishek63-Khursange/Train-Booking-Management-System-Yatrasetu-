package com.irctc.Exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(UserNotFoundException ex) {
        logger.warn("User not found: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), "USER_NOT_FOUND");
    }

    @ExceptionHandler(TrainNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleTrainNotFound(TrainNotFoundException ex) {
        logger.warn("Train not found: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), "TRAIN_NOT_FOUND");
    }

    @ExceptionHandler(CoachNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCoachNotFound(CoachNotFoundException ex) {
        logger.warn("Coach not found: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), "COACH_NOT_FOUND");
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        logger.warn("Resource not found: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), "RESOURCE_NOT_FOUND");
    }

    @ExceptionHandler(SeatsNotAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleSeatsNotAvailable(SeatsNotAvailableException ex) {
        logger.warn("Seats not available: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), "SEATS_NOT_AVAILABLE");
    }

    @ExceptionHandler(InvalidBookingRequestException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidBookingRequest(InvalidBookingRequestException ex) {
        logger.warn("Invalid booking request: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), "INVALID_BOOKING_REQUEST");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        logger.warn("Data integrity violation: {}", ex.getMessage());
        String message = ex.getMessage().contains("Duplicate entry") ? "Email, username, or phone number already exists" : "Database constraint violation";
        return buildErrorResponse(HttpStatus.BAD_REQUEST, message, "DATA_INTEGRITY_VIOLATION");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex) {
        logger.warn("Authentication failed: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Invalid or expired token", "AUTHENTICATION_FAILED");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        logger.warn("Bad request: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Invalid input: " + ex.getMessage(), "BAD_REQUEST");
    }

//    @ExceptionHandler(HttpMessageNotReadableException.class)
//    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
//        logger.warn("Malformed JSON request: {}", ex.getMessage());
//        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Malformed JSON request", "BAD_REQUEST_BODY");
//    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        logger.warn("Access denied: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Unauthorized access", "ACCESS_DENIED");
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        logger.error("Unsupported Media Type: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported Media Type", "UNSUPPORTED_MEDIA_TYPE");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        logger.error("Unexpected error", ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", "INTERNAL_ERROR");
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message, String errorCode) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        response.put("errorCode", errorCode);
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }
}