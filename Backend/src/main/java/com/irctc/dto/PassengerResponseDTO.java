package com.irctc.dto;

import com.irctc.model.Passenger;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for passenger information in booking responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassengerResponseDTO {
    private String name;
    private int age;
    private String gender;
    private String status;     // e.g. CONFIRMED
    private String seatNumber; // new field for seat assignment

    /**
     * Creates a DTO from Passenger entity with default seat number
     */
    public static PassengerResponseDTO fromEntity(Passenger passenger) {
        return new PassengerResponseDTO(
            passenger.getName(),
            passenger.getAge(),
            passenger.getGender(),
            "CONFIRMED",
            "--"  // Default seat number when not assigned
        );
    }

    /**
     * Creates a DTO from Passenger entity with specific seat number
     */
    public static PassengerResponseDTO fromEntityWithSeat(Passenger passenger, String seatNumber) {
        return new PassengerResponseDTO(
            passenger.getName(),
            passenger.getAge(),
            passenger.getGender(),
            "CONFIRMED",
            seatNumber != null ? seatNumber : "--"
        );
    }
}
