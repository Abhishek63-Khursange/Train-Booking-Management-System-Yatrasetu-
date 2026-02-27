// ✅ Booking.java
package com.irctc.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate travelDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus bookingStatus;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "train_id")
    @JsonBackReference
    private Train train;

    private LocalDateTime bookingTime;

    private String seatClass;

    @Column(nullable = false, unique = true)
    private String pnr;

    private String fromStation;

    private String toStation;
    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "stripe_session_id", unique = true)
    private String stripeSessionId;


    @ManyToMany
    @JoinTable(
        name = "booking_seats",
        joinColumns = @JoinColumn(name = "booking_id"),
        inverseJoinColumns = @JoinColumn(name = "seat_id")
    )
    private List<Seat> seats;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Passenger> passengers;

    public enum BookingStatus {
        CONFIRMED, CANCELLED
    }
}
