package com.irctc.service;

import com.irctc.Exception.ResourceNotFoundException;
import com.irctc.Exception.TrainNotFoundException;
import com.irctc.model.Coach;
import com.irctc.model.Seat;
import com.irctc.model.Train;
import com.irctc.repository.CoachRepository;
import com.irctc.repository.SeatRepository;
import com.irctc.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;


import java.time.*;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainService {
    private final TrainRepository trainRepository;
    private final CoachRepository coachRepository;
    private final SeatRepository seatRepository;

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    public Train addTrainWithDefaultCoaches(Train train) {
        List<Coach> coaches = new ArrayList<>();
        // Create 10 coaches: D1 to D10
        for (int i = 1; i <= 10; i++) {
            String coachNumber = "D" + i;
            Coach coach = new Coach();
            coach.setCoachNumber(coachNumber);
            coach.setFare(500.0); // Default fare
            coach.setTrain(train); // Set the unsaved train instance

            List<Seat> seats = new ArrayList<>();
            // Create 100 seats in each coach
            for (int j = 1; j <= 100; j++) {
                Seat seat = new Seat();
                seat.setSeatNumber(j);
                seat.setCoach(coach);
                seat.setAvailable(true); // default to available
                seat.setBooked(false); // default to not booked
                seat.setFare(coach.getFare()); // set fare from coach
                seats.add(seat);
            }
            coach.setSeats(seats);
            coaches.add(coach);
        }
        train.setCoaches(coaches);

        return trainRepository.save(train);
    }



    public List<Train> findTrains(String source, String destination, LocalDate date) {
        if (source == null || destination == null || date == null) {
            throw new IllegalArgumentException("Source, destination, and date are required");
        }

        DayOfWeek dayOfWeek = date.getDayOfWeek();
        Map<String, String> dayMap = Map.of(
                "MONDAY", "MO", "TUESDAY", "TU", "WEDNESDAY", "WE",
                "THURSDAY", "TH", "FRIDAY", "FR", "SATURDAY", "SA", "SUNDAY", "SU"
        );
        String dayAbbreviation = dayMap.get(dayOfWeek.toString());

        List<Train> trains = trainRepository.findTrainsByDay(source, destination, dayAbbreviation);
        if (trains.isEmpty()) {
            throw new TrainNotFoundException("No trains found from " + source + " to " + destination + " on " + date);
        }

        if (date.equals(LocalDate.now(IST))) {
            LocalTime now = LocalTime.now(IST);
            trains = trains.stream()
                    .filter(train -> train.getDepartureTime() != null && train.getDepartureTime().isAfter(now))
                    .collect(Collectors.toList());

            if (trains.isEmpty()) {
                throw new TrainNotFoundException("No upcoming trains remaining for today from " + source + " to " + destination);
            }
        }

        return trains;
    }

    public Page<Train> findAllTrains(int page, int size) {
        return trainRepository.findAll(PageRequest.of(page, size));
    }

    public List<Train> findAll() {
        return trainRepository.findAll();
    }

    
    public Train updateTrain(Long id, Map<String, Object> updates) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found with id: " + id));

        updates.forEach((key, value) -> {
            if (value != null) {
                try {
                    switch (key) {
                        case "number":
                            train.setNumber(Integer.parseInt(value.toString()));
                            break;
                        case "name":
                            train.setName((String) value);
                            break;
                        case "fromStation":
                            train.setFromStation((String) value);
                            break;
                        case "toStation":
                            train.setToStation((String) value);
                            break;
                        case "departureTime":
                            train.setDepartureTime(LocalTime.parse(value.toString()));
                            break;
                        case "arrivalTime":
                            train.setArrivalTime(LocalTime.parse(value.toString()));
                            break;
                        case "runningDays":
                            train.setRunningDays((String) value);
                            break;
                        case "scheduledDate":
                            train.setScheduledDate(LocalDate.parse(value.toString()));
                            break;
                        case "actualRunningDate":
                            train.setActualRunningDate(value != null ? LocalDate.parse(value.toString()) : null);
                            break;
                        default:
                            // Ignore unknown fields
                            break;
                    }
                } catch (Exception e) {
                    throw new IllegalArgumentException("Invalid value for field '" + key + "': " + e.getMessage());
                }
            }
        });

        // Validate train times after updates
        if (train.getDepartureTime() != null && train.getArrivalTime() != null) {
            if (train.getDepartureTime().isAfter(train.getArrivalTime())) {
                throw new IllegalArgumentException("Departure time must be before arrival time");
            }
        }

        return trainRepository.save(train);
    }

    public Optional<Train> findTrainById(Long id) {
        return trainRepository.findById(id);
    }

    public void deleteTrain(Long id) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found with id: " + id));
        trainRepository.delete(train);
    }

    private void updateIfNotBlank(String newValue, Consumer<String> setter) {
        if (newValue != null && !newValue.trim().isEmpty()) {
            setter.accept(newValue);
        }
    }
}
