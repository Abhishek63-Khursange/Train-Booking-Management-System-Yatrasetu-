package com.irctc.repository;

import com.irctc.model.Booking;
import com.irctc.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsBySeatsAndTravelDate(Seat seat, LocalDate travelDate);
    List<Booking> findByUserId(Long userId);
    Optional<Booking> findByPnr(String pnr);

    boolean existsByStripeSessionId(String stripeSessionId);
    
    // New method to check if seat is in any non-cancelled booking
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
           "FROM Booking b JOIN b.seats s " +
           "WHERE s.id = :seatId " +
           "AND b.travelDate = :travelDate " +
           "AND b.bookingStatus != 'CANCELLED'")
    boolean existsBySeatIdAndStatusNotCancelled(@Param("seatId") Long seatId, @Param("travelDate") LocalDate travelDate);
    
    // Additional method to check for BOOKING_IN_PROGRESS status
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
           "FROM Booking b JOIN b.seats s " +
           "WHERE s.id = :seatId " +
           "AND b.travelDate = :travelDate " +
           "AND b.bookingStatus = 'BOOKING_IN_PROGRESS'")
    boolean existsBySeatIdAndStatusBookingInProgress(@Param("seatId") Long seatId, @Param("travelDate") LocalDate travelDate);
}