package com.irctc.controller;

import com.irctc.dto.CoachDTO;
import com.irctc.model.Coach;
import com.irctc.model.Seat;
import com.irctc.model.Train;
import com.irctc.service.CoachService;
import com.irctc.service.TrainService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/trains")
@RequiredArgsConstructor
public class TrainController {
    private final TrainService trainService;
    private final CoachService coachService;
    private static final Logger logger = LoggerFactory.getLogger(TrainController.class);

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Train> addTrain(@Valid @RequestBody Train train) {
        Train savedTrain = trainService.addTrainWithDefaultCoaches(train);
        return ResponseEntity.ok(savedTrain);
    }


    @PostMapping("/coaches/{trainId}/create")
    @PreAuthorize("hasRole('ADMIN')")
   public ResponseEntity<Coach> createCoach(@PathVariable Long trainId,
                                         @RequestParam String coachNumber,
                                         @RequestParam double fare,
                                         @RequestParam(defaultValue = "100") int seatCount) {
    try {
        Coach coach = coachService.generateCoachSeats(trainId, coachNumber, fare, seatCount);
        return ResponseEntity.ok(coach);
    } catch (Exception e) {
        logger.error("Error creating coach: {}", e.getMessage());
        return ResponseEntity.badRequest().body(null);
    }
}


    @GetMapping("/{trainId}/coaches")
    public ResponseEntity<?> getCoachesByTrain(@PathVariable Long trainId) {
        logger.info("Received request for coaches of train ID: {}", trainId);
        
        if (trainId == null) {
            logger.error("Train ID is null in request");
            return ResponseEntity.badRequest().body("Train ID cannot be null");
        }
        
        try {
            logger.debug("Calling coachService.getCoachesByTrainId({})", trainId);
            List<CoachDTO> coaches = coachService.getCoachesByTrainId(trainId);
            logger.debug("Successfully retrieved {} coaches for train ID: {}", coaches.size(), trainId);
            return ResponseEntity.ok(coaches);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request for train ID {}: {}", trainId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error fetching coaches for train {}: {}", trainId, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body("An unexpected error occurred while fetching coaches. Please try again later.");
        }
    }



    @GetMapping("/coaches/{coachId}/seats")
    public ResponseEntity<List<Seat>> getCoachSeats(@PathVariable Long coachId) {
        try {
            return ResponseEntity.ok(coachService.getSeats(coachId));
        } catch (Exception e) {
            logger.error("Error fetching coach seats: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping
    public ResponseEntity<Page<Train>> getAllTrains(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(trainService.findAllTrains(page, size));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Train>> getAllTrains() {
        return ResponseEntity.ok(trainService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Train> getTrainById(@PathVariable Long id) {
        return trainService.findTrainById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Train>> searchTrains(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam LocalDate date) {
        try {
            return ResponseEntity.ok(trainService.findTrains(source, destination, date));
        } catch (Exception e) {
            logger.error("Error searching trains: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Train> updateTrain(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Train updatedTrain = trainService.updateTrain(id, updates);
        return ResponseEntity.ok(updatedTrain);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTrain(@PathVariable Long id) {
        try {
            trainService.deleteTrain(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting train: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}