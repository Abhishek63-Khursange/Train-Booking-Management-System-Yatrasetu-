package com.irctc.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int age;
    private String gender;
    private String phone;
    
    private Long seatId;
    @Column(nullable = false)
    private String aadhaar;


    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;
}
