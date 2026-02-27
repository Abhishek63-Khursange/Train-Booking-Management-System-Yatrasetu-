package com.irctc.controller;

import com.irctc.dto.SupportRequest;
import com.irctc.model.Support;
import com.irctc.model.SupportStatus;
import com.irctc.model.User;
import com.irctc.repository.SupportRepository;
import com.irctc.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Tag(name = "Support", description = "Support Ticket Management APIs")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private static final Logger logger = LoggerFactory.getLogger(SupportController.class);
    private final SupportRepository supportRepository;
    private final UserRepository userRepository;

   
    @Operation(
        summary = "Submit a new support ticket",
        description = "Allows users to submit a new support ticket with their issue"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Support ticket created successfully",
        content = @Content(schema = @Schema(implementation = Map.class))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Invalid input"
    )
    @PostMapping("/public")
    public ResponseEntity<?> submitSupportRequest(@Valid @RequestBody SupportRequest request) {
        try {
            logger.info("Received new support request from: {} - {}", request.getEmail(), request.getName());
            
            Support support = new Support();
            support.setName(request.getName());
            support.setEmail(request.getEmail());
            support.setIssue(request.getIssue());
            support.setStatus(SupportStatus.OPEN);
            support.setResolved(false);
            support.setSubmittedAt(LocalDateTime.now());
            
            
            String issue = request.getIssue().toLowerCase();
            if (issue.contains("booking") || issue.contains("reservation")) {
                support.setCategory("BOOKING");
            } else if (issue.contains("payment") || issue.contains("refund")) {
                support.setCategory("PAYMENT");
            } else if (issue.contains("train") || issue.contains("schedule")) {
                support.setCategory("TRAIN");
            } else {
                support.setCategory("GENERAL");
            }
            
            Support savedTicket = supportRepository.save(support);
            logger.info("Created support ticket ID: {} for {}", savedTicket.getId(), savedTicket.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Support request submitted successfully!");
            response.put("ticketId", savedTicket.getId());
            response.put("status", savedTicket.getStatus());
            response.put("submittedAt", savedTicket.getSubmittedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error creating support ticket: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to submit support request. Please try again later."));
        }
    }

 
    @Operation(
        summary = "Get all support tickets",
        description = "Retrieves a paginated list of all support tickets (Admin only)"
    )
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<Support>> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submittedAt,desc") String[] sort) {
        
        try {
            logger.info("Fetching all support tickets - page: {}, size: {}", page, size);
            
            Pageable pageable = PageRequest.of(page, size, parseSortParameter(sort));
            Page<Support> tickets = supportRepository.findAll(pageable);
            
            return ResponseEntity.ok(tickets);
            
        } catch (Exception e) {
            logger.error("Error fetching support tickets: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
    @Operation(
        summary = "Get ticket by ID",
        description = "Retrieves a specific support ticket by its ID"
    )
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        try {
            logger.debug("Fetching ticket with ID: {}", id);
            
            return supportRepository.findById(id)
                .map(ticket -> {
                    // Only allow access to the ticket owner or admin
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    boolean isAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    
                    if (isAdmin || ticket.getEmail().equals(auth.getName())) {
                        return ResponseEntity.ok(ticket);
                    } else {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied"));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            logger.error("Error fetching ticket {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

  
    @Operation(
        summary = "Update ticket status",
        description = "Updates the status of a support ticket (Admin only)"
    )
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam SupportStatus status,
            @RequestParam(required = false) String notes) {
        
        try {
            logger.info("Updating status of ticket {} to {}", id, status);
            
            return supportRepository.findById(id)
                .map(ticket -> {
                    ticket.setStatus(status);
                    if (notes != null && !notes.trim().isEmpty()) {
                        String adminNotes = "[Status Update: " + status + "] " + notes;
                        if (ticket.getAdminNotes() != null) {
                            adminNotes = ticket.getAdminNotes() + "\n" + adminNotes;
                        }
                        ticket.setAdminNotes(adminNotes);
                    }
                    
                    Support updatedTicket = supportRepository.save(ticket);
                    logger.info("Updated ticket {} status to {}", id, status);
                    
                    return ResponseEntity.ok(updatedTicket);
                })
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            logger.error("Error updating ticket {} status: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update ticket status"));
        }
    }

   
    @Operation(
        summary = "Assign ticket to admin",
        description = "Assigns a support ticket to an admin user (Admin only)"
    )
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignTicketToAdmin(
            @PathVariable Long id,
            @RequestParam Long adminId) {
        
        try {
            logger.info("Assigning ticket {} to admin {}", id, adminId);
            
            return supportRepository.findById(id)
                .flatMap(ticket -> userRepository.findById(adminId)
                    .map(admin -> {
                        ticket.setAssignedTo(admin);
                        ticket.setStatus(SupportStatus.IN_PROGRESS);
                        
                        String note = "Assigned to " + admin.getUsername();
                        ticket.setAdminNotes(ticket.getAdminNotes() != null ? 
                            ticket.getAdminNotes() + "\n" + note : note);
                            
                        Support updatedTicket = supportRepository.save(ticket);
                        logger.info("Assigned ticket {} to admin {}", id, adminId);
                        
                        return ResponseEntity.ok(updatedTicket);
                    })
                )
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            logger.error("Error assigning ticket {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to assign ticket"));
        }
    }

    
    @Operation(
        summary = "Get my tickets",
        description = "Retrieves all support tickets submitted by the current user"
    )
    @GetMapping("/my-tickets")
    public ResponseEntity<?> getMyTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            logger.debug("Fetching tickets for user: {}", userEmail);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("submittedAt").descending());
            Page<Support> tickets = supportRepository.findByEmail(userEmail, pageable);
            
            return ResponseEntity.ok(tickets);
            
        } catch (Exception e) {
            logger.error("Error fetching user tickets: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

   
    @Operation(
        summary = "Add response to ticket",
        description = "Adds a response to a support ticket (Admin only)"
    )
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/response")
    public ResponseEntity<?> addResponse(
            @PathVariable Long id,
            @RequestParam String response) {
        
        try {
            logger.info("Adding response to ticket {}", id);
            
            return supportRepository.findById(id)
                .map(ticket -> {
                    if (ticket.getResponse() == null) {
                        ticket.setResponse(response);
                    } else {
                        ticket.setResponse(ticket.getResponse() + "\n\n---\n\n" + response);
                    }
                    
                    Support updatedTicket = supportRepository.save(ticket);
                    logger.info("Added response to ticket {}", id);
                    
                    return ResponseEntity.ok(updatedTicket);
                })
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            logger.error("Error adding response to ticket {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to add response"));
        }
    }

  
    @Operation(
        summary = "Get ticket statistics",
        description = "Retrieves statistics about support tickets (Admin only)"
    )
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTicketStats() {
        try {
            logger.debug("Fetching support ticket statistics");
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", supportRepository.count());
            stats.put("open", supportRepository.countByStatus(SupportStatus.OPEN));
            stats.put("inProgress", supportRepository.countByStatus(SupportStatus.IN_PROGRESS));
            stats.put("resolved", supportRepository.countByStatus(SupportStatus.RESOLVED));
            stats.put("closed", supportRepository.countByStatus(SupportStatus.CLOSED));
            
            // Get tickets needing attention (unresolved and older than 24 hours)
            List<Support> attentionNeeded = supportRepository.findTicketsNeedingAttention();
            stats.put("needsAttention", attentionNeeded.size());
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Error fetching ticket statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

   
    private Sort parseSortParameter(String[] sort) {
        if (sort.length >= 2) {
            return Sort.by(new Sort.Order(
                Sort.Direction.fromString(sort[1]),
                sort[0]
            ));
        } else if (sort.length == 1) {
            return Sort.by(sort[0]).descending();
        }
        return Sort.by("submittedAt").descending();
    }
}
