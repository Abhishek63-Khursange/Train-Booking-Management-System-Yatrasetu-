package com.irctc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeatLayoutResponse {
    private Long seatId;
    private int seatNumber;
    private boolean isBooked;
}
