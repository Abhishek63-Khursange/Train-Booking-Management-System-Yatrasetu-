package com.irctc.dto;

import java.util.List;

import com.irctc.model.Coach;
import com.irctc.model.Seat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoachDTO {
    private Long id;
    private String coachNumber;
    private double fare;
    private int availableSeats;
    private List<SeatDTO> seats;
    
    // Add a static method to convert from entity to DTO
    public static CoachDTO fromEntity(Coach coach) {
        CoachDTO dto = new CoachDTO();
        if (coach != null) {
            dto.setId(coach.getId());
            dto.setCoachNumber(coach.getCoachNumber());
            dto.setFare(coach.getFare());
            if (coach.getSeats() != null) {
                dto.setAvailableSeats((int) coach.getSeats().stream()
                    .filter(Seat::isAvailable)
                    .count());
                dto.setSeats(coach.getSeats().stream()
                    .map(SeatDTO::fromEntity)
                    .toList());
            } else {
                dto.setAvailableSeats(0);
                dto.setSeats(List.of());
            }
        }
        return dto;
    }
}

