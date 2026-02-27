package com.irctc.service;

import com.irctc.Exception.ResourceNotFoundException;
import com.irctc.Exception.SeatsNotAvailableException;
import com.irctc.model.Seat;
import com.irctc.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {
    private final SeatRepository seatRepo;

    public Page<Seat> getAllSeats(int page, int size) {
        return seatRepo.findAll(PageRequest.of(page, size));
    }

    public Seat getSeatById(Long id) {
        return seatRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + id));
    }

    public List<Seat> getSeatsByCoach(Long coachId) {
        return seatRepo.findByCoachId(coachId);
    }

    public List<Seat> getAvailableSeats(Long coachId) {
        return seatRepo.findByCoachIdAndAvailableTrue(coachId);
    }

    public List<Seat> getBookedSeats(Long coachId) {
        return seatRepo.findByCoachIdAndAvailableFalse(coachId);
    }

    public Seat bookSeat(Long seatId) {
        Seat seat = getSeatById(seatId);
        if (!seat.isAvailable()) {
            throw new SeatsNotAvailableException("Seat " + seat.getSeatNumber() + " is already booked");
        }
        seat.setAvailable(false);
        return seatRepo.save(seat);
    }

    public Seat unbookSeat(Long seatId) {
        Seat seat = getSeatById(seatId);
        if (seat.isAvailable()) {
            throw new IllegalStateException("Seat " + seat.getSeatNumber() + " is already available");
        }
        seat.setAvailable(true);
        return seatRepo.save(seat);
    }
}