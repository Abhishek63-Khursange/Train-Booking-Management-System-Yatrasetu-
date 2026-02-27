package com.irctc.controller;

import com.irctc.model.Seat;
import com.irctc.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {
    private final SeatService seatService;

    @GetMapping
    public ResponseEntity<Page<Seat>> getAllSeats(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(seatService.getAllSeats(page, size));
    }

    @GetMapping("/{seatId}")
    public ResponseEntity<Seat> getSeatById(@PathVariable Long seatId) {
        return ResponseEntity.ok(seatService.getSeatById(seatId));
    }

    @GetMapping("/coach/{coachId}")
    public ResponseEntity<List<Seat>> getSeatsByCoach(@PathVariable Long coachId) {
        return ResponseEntity.ok(seatService.getSeatsByCoach(coachId));
    }

    @GetMapping("/available/{coachId}")
    public ResponseEntity<List<Seat>> getAvailableSeats(@PathVariable Long coachId) {
        return ResponseEntity.ok(seatService.getAvailableSeats(coachId));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/book/{seatId}")
    public ResponseEntity<Seat> bookSeat(@PathVariable Long seatId) {
        return ResponseEntity.ok(seatService.bookSeat(seatId));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/unbook/{seatId}")
    public ResponseEntity<Seat> unbookSeat(@PathVariable Long seatId) {
        return ResponseEntity.ok(seatService.unbookSeat(seatId));
    }
}