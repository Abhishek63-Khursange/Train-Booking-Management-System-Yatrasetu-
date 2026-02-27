package com.irctc.service;

import com.irctc.dto.CoachDTO;
import com.irctc.dto.CoachLayoutResponse;
import com.irctc.dto.SeatDTO;
import com.irctc.dto.SeatLayoutResponse;
import com.irctc.model.Coach;
import com.irctc.model.Seat;
import com.irctc.model.Train;
import com.irctc.repository.CoachRepository;
import com.irctc.repository.SeatRepository;
import com.irctc.repository.TrainRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoachService {
    private final CoachRepository coachRepo;
    private final SeatRepository seatRepo;
    private final TrainRepository trainRepo;

    @Transactional
    public void createCoachesForTrain(Long trainId) {
        log.info("Creating coaches for train ID: {}", trainId);
        if (trainId == null) {
            throw new IllegalArgumentException("Train ID cannot be null");
        }
        Train train = trainRepo.findById(trainId).orElseThrow(() -> new RuntimeException("Train not found"));

        for (int i = 1; i <= 10; i++) {
            Coach coach = new Coach();
            coach.setCoachNumber("D" + i);
            coach.setFare(500.0); // Default fare
            coach.setTrain(train);
            coach = coachRepo.save(coach);

            List<Seat> seats = new ArrayList<>();
            for (int j = 1; j <= 100; j++) {
                Seat seat = new Seat();
                seat.setSeatNumber(j);
                seat.setCoach(coach);
                seat.setBooked(false);
                seat.setAvailable(true);
                seat.setFare(coach.getFare());
                seats.add(seat);
            }
            seatRepo.saveAll(seats);
        }
    }
    
    @Transactional
    public Coach generateCoachSeats(Long trainId, String coachNumber, double fare, int seatCount) {
        log.info("Generating {} seats for coach {} in train {}", seatCount, coachNumber, trainId);
        if (trainId == null || coachNumber == null || coachNumber.trim().isEmpty() || fare <= 0 || seatCount <= 0) {
            throw new IllegalArgumentException("Invalid input parameters");
        }
        Train train = trainRepo.findById(trainId)
                .orElseThrow(() -> new RuntimeException("Train not found with id: " + trainId));
        
        Coach coach = new Coach();
        coach.setCoachNumber(coachNumber);
        coach.setFare(fare);
        coach.setTrain(train);
        Coach savedCoach = coachRepo.save(coach);
        
        List<Seat> seats = new ArrayList<>();
        for (int i = 1; i <= seatCount; i++) {
            Seat seat = new Seat();
            seat.setSeatNumber(i);
            seat.setCoach(savedCoach);
            seat.setBooked(false);
            seat.setAvailable(true);
            seat.setFare(fare);
            seats.add(seat);
        }
        seatRepo.saveAll(seats);
        
        return savedCoach;
    }

    @Transactional(readOnly = true)
    public List<CoachDTO> getCoachesByTrainId(Long trainId) {
        log.info("Entering getCoachesByTrainId with trainId: {}", trainId);
        
        try {
            if (trainId == null) {
                String errorMsg = "Train ID cannot be null";
                log.error(errorMsg);
                throw new IllegalArgumentException(errorMsg);
            }
            
            log.debug("Fetching coaches for train ID: {}", trainId);
            
            // Verify train exists first
            boolean trainExists = trainRepo.existsById(trainId);
            log.debug("Train exists check result for ID {}: {}", trainId, trainExists);
            
            if (!trainExists) {
                String errorMsg = String.format("Train not found with ID: %d", trainId);
                log.warn(errorMsg);
                throw new IllegalArgumentException(errorMsg);
            }
            
            log.debug("Fetching coaches with seats for train ID: {}", trainId);
            List<Coach> coaches = coachRepo.findByTrainIdWithSeats(trainId);
            log.debug("Found {} coaches for train ID: {}", coaches.size(), trainId);
            
            if (coaches.isEmpty()) {
                log.info("No coaches found for train ID: {}", trainId);
                return List.of();
            }
            
            return coaches.stream()
                .map(coach -> {
                    try {
                        CoachDTO dto = new CoachDTO();
                        dto.setId(coach.getId());
                        dto.setCoachNumber(coach.getCoachNumber());
                        dto.setFare(coach.getFare());
                        
                        if (coach.getSeats() != null) {
                            dto.setAvailableSeats((int) coach.getSeats().stream()
                                .filter(Seat::isAvailable)
                                .count());
                            dto.setSeats(coach.getSeats().stream()
                                .map(seat -> {
                                    SeatDTO seatDto = new SeatDTO();
                                    seatDto.setId(seat.getId());
                                    seatDto.setSeatNumber(seat.getSeatNumber());
                                    seatDto.setAvailable(seat.isAvailable());
                                    seatDto.setBooked(seat.isBooked());
                                    seatDto.setFare(seat.getFare());
                                    return seatDto;
                                })
                                .collect(Collectors.toList()));
                        } else {
                            dto.setAvailableSeats(0);
                            dto.setSeats(List.of());
                        }
                        return dto;
                    } catch (Exception e) {
                        log.error("Error mapping coach with ID {}: {}", coach != null ? coach.getId() : "null", e.getMessage(), e);
                        throw new RuntimeException("Error processing coach data", e);
                    }
                })
                .collect(Collectors.toList());
                
       
        } catch (Exception e) {
            log.error("Error fetching coaches for train ID {}: {}", trainId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch coaches. Please try again later.", e);
        }
    }

    @Transactional(readOnly = true)
    public List<Seat> getSeats(Long coachId) {
        return seatRepo.findByCoachId(coachId);
    }
    
    @Transactional(readOnly = true)
    public List<CoachLayoutResponse> getCoachLayoutsByTrainId(Long trainId) {
        if (trainId == null) {
            throw new IllegalArgumentException("Train ID cannot be null");
        }
        
        // First get all coaches for the train
        List<Coach> coaches = coachRepo.findByTrainId(trainId);
        if (coaches.isEmpty()) {
            return List.of();
        }
        
        // Get all seat data in a single query
        List<Object[]> seatData = seatRepo.findSeatLayoutsByTrainId(trainId);
        
        // Group seat data by coach ID
        Map<Long, List<SeatLayoutResponse>> seatsByCoach = seatData.stream()
            .collect(Collectors.groupingBy(
                data -> (Long) data[0], // coachId
                Collectors.mapping(
                    data -> new SeatLayoutResponse((Long) data[1], (Integer) data[2], (Boolean) data[3]),
                    Collectors.toList()
                )
            ));
        
        // Build the response
        return coaches.stream()
            .map(coach -> new CoachLayoutResponse(
                coach.getCoachNumber(),
                coach.getId(),
                seatsByCoach.getOrDefault(coach.getId(), List.of())
            ))
            .collect(Collectors.toList());
    }
}