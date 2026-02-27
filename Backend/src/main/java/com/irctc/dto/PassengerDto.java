package com.irctc.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PassengerDto {

    @NotNull(message = "Seat ID is required")
    @Positive(message = "Seat ID must be positive")
    private Long seatId;

    @NotBlank(message = "Passenger name is required")
    private String name;

    @Min(value = 0, message = "Age must be non-negative")
    private int age;

    @NotBlank(message = "Gender is required")
    private String gender;
    @Pattern(regexp = "\\d{12}", message = "Aadhaar must be a 12-digit number")
    private String aadhaar;


    @Pattern(regexp = "\\d{10}", message = "Phone number must be 10 digits")
    private String phone;
}
