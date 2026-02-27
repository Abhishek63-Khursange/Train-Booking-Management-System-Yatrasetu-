package com.irctc.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeatBookingRequest {

    @NotNull(message = "Train ID is required")
    @Positive(message = "Train ID must be positive")
    private Long trainId;

    @NotNull(message = "Travel date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @FutureOrPresent(message = "Travel date must be today or in the future")
    private LocalDate travelDate;

    @NotEmpty(message = "At least one seat ID is required")
    private List<@Positive(message = "Seat ID must be positive") Long> seatIds;

    @NotBlank(message = "From station is required")
    private String fromStation;

    @NotBlank(message = "To station is required")
    private String toStation;

    @NotEmpty(message = "Passenger details are required")
    private List<@Valid PassengerDto> passengers;
}
