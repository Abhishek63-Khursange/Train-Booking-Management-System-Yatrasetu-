package com.irctc.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coach {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Coach number is required")
    private String coachNumber;

    @Positive(message = "Fare must be positive")
    private double fare;

    @ManyToOne
    @JoinColumn(name = "train_id")
    @JsonBackReference(value = "train-coach")
    private Train train;

    @OneToMany(mappedBy = "coach", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "coach-seat")
    private List<Seat> seats = new ArrayList<>();
}