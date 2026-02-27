package com.irctc.repository;

import com.irctc.model.Support;
import com.irctc.model.SupportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Support ticket operations.
 * Provides CRUD operations and custom queries for support tickets.
 */
public interface SupportRepository extends JpaRepository<Support, Long> {

    /**
     * Find all unresolved support tickets
     * @return List of unresolved support tickets
     */
    List<Support> findByResolvedFalse();

    /**
     * Find all support tickets by status
     * @param status The status to filter by
     * @return List of support tickets with the given status
     */
    List<Support> findByStatus(SupportStatus status);

    /**
     * Find all support tickets by status with pagination
     * @param status The status to filter by
     * @param pageable Pagination information
     * @return Page of support tickets
     */
    Page<Support> findByStatus(SupportStatus status, Pageable pageable);

    /**
     * Find all support tickets for a specific email
     * @param email The email to search for
     * @return List of support tickets for the given email
     */
    List<Support> findByEmail(String email);

    /**
     * Find all support tickets for a specific email with pagination
     * @param email The email to search for
     * @param pageable Pagination information
     * @return Page of support tickets
     */
    Page<Support> findByEmail(String email, Pageable pageable);

    /**
     * Find all support tickets by priority
     * @param priority The priority to filter by
     * @return List of support tickets with the given priority
     */
    List<Support> findByPriority(String priority);

    /**
     * Find all support tickets by category
     * @param category The category to filter by
     * @return List of support tickets in the given category
     */
    List<Support> findByCategory(String category);

    /**
     * Count all support tickets by status
     * @param status The status to count
     * @return Count of tickets with the given status
     */
    long countByStatus(SupportStatus status);

    /**
     * Custom query to find tickets that need attention (unresolved and older than 24 hours)
     * @return List of tickets needing attention
     */
    /**
     * Custom query to find tickets that need attention (unresolved and older than 24 hours)
     * @return List of tickets needing attention
     */
    @Query("SELECT s FROM Support s WHERE s.resolved = false AND s.submittedAt < FUNCTION('DATE_SUB', CURRENT_TIMESTAMP, 1, 'DAY')")
    List<Support> findTicketsNeedingAttention();

    /**
     * Check if a ticket with the given ID exists and is assigned to the given user
     * @param id Ticket ID
     * @param userId User ID
     * @return true if the ticket exists and is assigned to the user
     */
    @Query("SELECT COUNT(s) > 0 FROM Support s WHERE s.id = :id AND s.assignedTo.id = :userId")
    boolean existsByIdAndAssignedTo(@Param("id") Long id, @Param("userId") Long userId);
}
