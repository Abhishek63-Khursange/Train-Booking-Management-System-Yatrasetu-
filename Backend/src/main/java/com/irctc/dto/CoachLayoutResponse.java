package com.irctc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CoachLayoutResponse {
    private String coachNumber;
    private Long coachId;
    private List<SeatLayoutResponse> seats;
}
