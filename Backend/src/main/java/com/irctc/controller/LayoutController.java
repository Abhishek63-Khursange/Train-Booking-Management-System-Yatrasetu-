package com.irctc.controller;

import com.irctc.dto.CoachLayoutResponse;
import com.irctc.dto.SeatLayoutResponse;
import com.irctc.model.Seat;
import com.irctc.service.CoachService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/layout")
@RequiredArgsConstructor
public class LayoutController {

    private final CoachService coachService;

    @GetMapping("/seats/{coachId}")
    public List<SeatLayoutResponse> getSeatLayout(@PathVariable Long coachId) {
        // This method is not used in the current implementation, but keeping it for backward compatibility
        return null;
    }
    
    @GetMapping("/coaches/{trainId}")
    public List<CoachLayoutResponse> getCoachLayouts(@PathVariable Long trainId) {
        return coachService.getCoachLayoutsByTrainId(trainId);
    }
}
