package com.irctc.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trains")
@Getter
@Setter
@NoArgsConstructor
public class Train {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Train name is required")
    private String name;

    @Min(value = 10000, message = "Train number should be at least 5 digits")
    private int number;

    @NotBlank(message = "Source station is required")
    @Column(name = "from_station", nullable = false)
    private String fromStation;

    @NotBlank(message = "Destination station is required")
    @Column(name = "to_station", nullable = false)
    private String toStation;

    @JsonFormat(pattern = "HH:mm")
    @Column(name = "departure_time")
    private LocalTime departureTime;

    @JsonFormat(pattern = "HH:mm")
    @Column(name = "arrival_time")
    private LocalTime arrivalTime;

    @Pattern(
        regexp = "^(MO|TU|WE|TH|FR|SA|SU)(,(MO|TU|WE|TH|FR|SA|SU))*$",
        message = "Days must be comma-separated codes: MO, TU, WE, TH, FR, SA, SU"
    )
    @Column(name = "running_days")
    private String runningDays;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "actual_running_date")
    private LocalDate actualRunningDate;

    @OneToMany(mappedBy = "train", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "train-coach")
    private List<Coach> coaches = new ArrayList<>();

    @OneToMany(mappedBy = "train", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "train-booking")
    @JsonIgnore
    private List<Booking> bookings = new ArrayList<>();
}