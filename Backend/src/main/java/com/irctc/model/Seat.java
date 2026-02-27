package com.irctc.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int seatNumber;
    private boolean available;
    
    @Column(nullable = false)
    private double fare;

    @Column(name = "is_booked", nullable = false)
    private boolean booked = false;

    @ManyToOne
    @JoinColumn(name = "coach_id")
    @JsonBackReference(value = "coach-seat")
    private Coach coach;
}