package com.irctc.dto;

import com.irctc.model.Seat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatDTO {
    private Long id;
    private int seatNumber;
    private boolean available;
    private double fare;
    private boolean booked;
    
    public static SeatDTO fromEntity(Seat seat) {
        SeatDTO dto = new SeatDTO();
        dto.setId(seat.getId());
        dto.setSeatNumber(seat.getSeatNumber());
        dto.setAvailable(seat.isAvailable());
        dto.setFare(seat.getFare());
        dto.setBooked(seat.isBooked());
        return dto;
    }
}