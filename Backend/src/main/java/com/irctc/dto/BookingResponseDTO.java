package com.irctc.dto;

import com.irctc.model.Booking;
import com.irctc.model.Passenger;
import com.irctc.model.Seat;
import com.irctc.model.Train;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for booking response with detailed information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {
    private Long id;
    private String pnr;
    private String fromStation;
    private String toStation;
    private String bookingStatus;
    private String travelDate;    // as string for safe parsing on FE
    private TrainSummaryDTO train;
    private CoachSummaryDTO coach;
    private FareDTO fare;
    private List<PassengerResponseDTO> passengers;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrainSummaryDTO {
        private String trainNumber;
        private String trainName;
        private String departureTime; // ISO string
        private String arrivalTime;   // ISO string
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CoachSummaryDTO {
        private String coachNumber;
        private String coachClass;
        private double fare; // per passenger
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FareDTO {
        private double baseFare;           // baseFare * passengerCount
        private double reservationCharges; // e.g., 60.0
        private double gst;                // 5% rounded/ceil
        private double totalFare;
    }

    public static BookingResponseDTO fromEntity(Booking booking) {
        // Train
        Train train = booking.getTrain();
        TrainSummaryDTO trainDTO = null;
        if (train != null && booking.getTravelDate() != null) {
            LocalDate travelDate = booking.getTravelDate();
            LocalTime departureTime = train.getDepartureTime();
            LocalTime arrivalTime = train.getArrivalTime();

            LocalDateTime departureDateTime = travelDate.atTime(departureTime);
            // Handle overnight trains where arrival is on the next day
            LocalDateTime arrivalDateTime = arrivalTime.isBefore(departureTime) 
                ? travelDate.plusDays(1).atTime(arrivalTime) 
                : travelDate.atTime(arrivalTime);

            trainDTO = new TrainSummaryDTO(
                safe(String.valueOf(train.getNumber())),
                safe(train.getName()),
                toIso(departureDateTime),
                toIso(arrivalDateTime)
            );
        }

        // Coach & fare (derive from first seat's coach if seats present)
        CoachSummaryDTO coachDTO = null;
        double perPassengerFare = 0.0;
        if (booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            Seat firstSeat = booking.getSeats().get(0);
            if (firstSeat.getCoach() != null) {
                coachDTO = new CoachSummaryDTO(
                    safe(firstSeat.getCoach().getCoachNumber()),
                    booking.getSeatClass() != null ? booking.getSeatClass() : "",
                    firstSeat.getCoach().getFare()
                );
                perPassengerFare = firstSeat.getCoach().getFare();
            }
        }

        // Passengers with seat numbers (null-safe)
        List<Passenger> passengerEntities = booking.getPassengers() != null ? booking.getPassengers() : List.of();
        List<Seat> seatEntities = booking.getSeats() != null ? booking.getSeats() : List.of();
        List<PassengerResponseDTO> passengerDTOs = passengerEntities.isEmpty() ? List.of() :
            passengerEntities.stream()
                .map(p -> {
                    String seatNumber = "--";
                    if (!seatEntities.isEmpty() && seatEntities.size() == passengerEntities.size()) {
                        // zip by index
                        int idx = passengerEntities.indexOf(p);
                        Seat s = seatEntities.get(idx);
                        if (s != null) seatNumber = String.valueOf(s.getSeatNumber());
                    } else if (!seatEntities.isEmpty()) {
                        // fallback: take first available mapping
                        seatNumber = String.valueOf(seatEntities.get(0).getSeatNumber());
                    }
                    return PassengerResponseDTO.fromEntityWithSeat(p, seatNumber);
                })
                .collect(Collectors.toList());

        // Fare totals (optional)
        int paxCount = passengerEntities != null ? passengerEntities.size() : 0;
        double baseFareTotal = perPassengerFare * paxCount;
        double reservationCharges = 60.0;
        double gst = Math.ceil((baseFareTotal + reservationCharges) * 0.05);
        FareDTO fareDTO = new FareDTO(
            baseFareTotal, 
            reservationCharges, 
            gst, 
            baseFareTotal + reservationCharges + gst
        );

        return new BookingResponseDTO(
            booking.getId(),
            safe(booking.getPnr()),
            safe(booking.getFromStation()),
            safe(booking.getToStation()),
            booking.getBookingStatus() != null ? booking.getBookingStatus().name() : "CONFIRMED",
            booking.getTravelDate() != null ? booking.getTravelDate().toString() : "",
            trainDTO,
            coachDTO,
            fareDTO,
            passengerDTOs
        );
    }

    private static String safe(String s) { 
        return s == null ? "" : s; 
    }
    
    private static String toIso(LocalDateTime dt) { 
        return dt == null ? "" : dt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME); 
    }
}
