package com.irctc.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.irctc.Exception.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.irctc.dto.PassengerDto;
import com.irctc.dto.SeatBookingRequest;
import com.irctc.model.*;
import com.irctc.repository.*;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import org.springframework.transaction.annotation.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepo;
    private final TrainRepository trainRepo;
    private final SeatRepository seatRepo;
    private final UserRepository userRepo;
    private final PassengerRepository passengerRepo;

    @Data
    public static class PnrDetailsResponse {
        private String pnr;
        private LocalDateTime bookingTime;
        private String travelDate;
        private String bookingStatus;
        private String seatClass;
        private String userEmail;
        private String fromStation;
        private String toStation;
        private List<Long> seatIds;
        private Long trainId;
        private String trainName;
        private Long userId;
        private List<PassengerDto> passengers;
    }

    public Booking bookSeats(SeatBookingRequest request) {
        logger.info("bookSeats request: trainId={}, travelDate={}, seatIds={}, passengers={}",
                request != null ? request.getTrainId() : null,
                request != null ? request.getTravelDate() : null,
                request != null ? request.getSeatIds() : null,
                request != null && request.getPassengers() != null ? request.getPassengers().size() : 0);
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Train train = trainRepo.findById(request.getTrainId())
                .orElseThrow(() -> new TrainNotFoundException("Train not found"));

        // Lock seats to prevent concurrent bookings on the same seats
        List<Seat> seats = seatRepo.findAllByIdForUpdate(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new ResourceNotFoundException("Some seats are invalid");
        }

        for (Seat seat : seats) {
            // Check if seat is already booked (more comprehensive check)
            if (seat.isBooked() || !seat.isAvailable()) {
                throw new SeatsNotAvailableException("Seat " + seat.getSeatNumber() + " is already booked");
            }
            
            // Additional check: Verify seat is not in any non-cancelled booking
            if (bookingRepo.existsBySeatIdAndStatusNotCancelled(seat.getId(), request.getTravelDate())) {
                throw new SeatsNotAvailableException("Seat " + seat.getSeatNumber() + " is currently being booked by another user");
            }
            
            // Additional check: Verify seat is not in any booking in progress
            if (bookingRepo.existsBySeatIdAndStatusBookingInProgress(seat.getId(), request.getTravelDate())) {
                throw new SeatsNotAvailableException("Seat " + seat.getSeatNumber() + " is currently being booked by another user");
            }
            
            // Additional check: Verify seat is not in any booking with status 'BOOKING_IN_PROGRESS'
            if (bookingRepo.existsBySeatIdAndStatusBookingInProgress(seat.getId(), request.getTravelDate())) {
                throw new SeatsNotAvailableException("Seat " + seat.getSeatNumber() + " is currently being booked by another user");
            }
        }

        // Mark seats as booked (set both flags for consistency)
        seats.forEach(seat -> {
            seat.setAvailable(false);
            seat.setBooked(true);
        });
        seatRepo.saveAll(seats);

        if (request.getPassengers() == null || request.getPassengers().isEmpty()) {
            throw new IllegalArgumentException("At least one passenger is required");
        }

        Booking booking = new Booking();
        booking.setTrain(train);
        booking.setUser(user);
        booking.setSeats(seats);
        booking.setTravelDate(request.getTravelDate());
        booking.setBookingTime(LocalDateTime.now());
        booking.setBookingStatus(Booking.BookingStatus.CONFIRMED);
        booking.setPnr(generatePNR());
        booking.setSeatClass("Seating");
        booking.setUserEmail(user.getEmail());
        booking.setFromStation(request.getFromStation() != null ? request.getFromStation() : train.getFromStation());
        booking.setToStation(request.getToStation() != null ? request.getToStation() : train.getToStation());

        Booking savedBooking = bookingRepo.save(booking);

        // Save passengers
        List<Passenger> passengerEntities = request.getPassengers().stream().map(dto -> {
            Passenger p = new Passenger();
            p.setName(dto.getName());
            p.setAge(dto.getAge());
            p.setGender(dto.getGender());
            p.setPhone(dto.getPhone());
            p.setSeatId(dto.getSeatId());
            p.setBooking(savedBooking);
            p.setAadhaar(dto.getAadhaar());

            return p;
        }).toList();

        passengerRepo.saveAll(passengerEntities);
        savedBooking.setPassengers(passengerEntities);

        return savedBooking;
    }

    public PnrDetailsResponse getPnrDetails(String pnr) {
        logger.info("Searching for PNR: {}", pnr);
        Booking booking = bookingRepo.findByPnr(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with PNR: " + pnr));

        PnrDetailsResponse response = new PnrDetailsResponse();
        response.setPnr(booking.getPnr());
        response.setBookingTime(booking.getBookingTime());
        response.setTravelDate(booking.getTravelDate().toString());
        response.setBookingStatus(booking.getBookingStatus().toString());
        response.setSeatClass(booking.getSeatClass());
        response.setUserEmail(booking.getUserEmail());
        response.setFromStation(booking.getFromStation());
        response.setToStation(booking.getToStation());
        response.setSeatIds(booking.getSeats().stream().map(Seat::getId).toList());
        response.setTrainId(booking.getTrain().getId());
        response.setTrainName(booking.getTrain().getName());
        response.setUserId(booking.getUser().getId());

        // Map passengers to DTO
        List<PassengerDto> passengerDtos = booking.getPassengers().stream().map(p -> {
            PassengerDto dto = new PassengerDto();
            dto.setName(p.getName());
            dto.setAge(p.getAge());
            dto.setGender(p.getGender());
            dto.setPhone(p.getPhone());
            dto.setSeatId(p.getSeatId());
            return dto;
        }).toList();

        response.setPassengers(passengerDtos);
        return response;
    }

    private String generatePNR() {
        return "PNR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public boolean existsByStripeSessionId(String sessionId) {
        return bookingRepo.existsByStripeSessionId(sessionId);
    }
    
    @Transactional(readOnly = true)
    public List<Booking> getUserBookings() {
        // Get currently authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return bookingRepo.findByUserId(user.getId());
    }
    
    @Transactional(readOnly = true)
    public List<Booking> getAllBookings() {
        // Admin can see all bookings
        return bookingRepo.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepo.findById(id);
    }

    @Transactional
    public Map<String, Object> verifyAndCreateBooking(String sessionId) throws Exception {
        logger.info("Starting verifyAndCreateBooking for session: {}", sessionId);
        
        if (sessionId == null || sessionId.isEmpty()) {
            String errorMsg = "Session ID cannot be null or empty";
            logger.error(errorMsg);
            throw new Exception(errorMsg);
        }
        
        if (bookingRepo.existsByStripeSessionId(sessionId)) {
            String errorMsg = "Booking with session ID " + sessionId + " has already been confirmed";
            logger.warn(errorMsg);
            throw new Exception(errorMsg);
        }

        try {
            Session session = Session.retrieve(sessionId);

            if (!"paid".equals(session.getPaymentStatus())) {
                throw new Exception("Payment not successful. Status: " + session.getPaymentStatus());
            }

            Map<String, String> metadata = session.getMetadata();
            logger.info("Stripe session metadata keys: {}", metadata.keySet());
            logger.info("Stripe session metadata values: {}", metadata);

            // Validate and get trainId
            String trainIdStr = metadata.get("trainId");
            if (trainIdStr == null || trainIdStr.equals("null") || trainIdStr.trim().isEmpty()) {
                String errorMsg = "Train ID is missing or invalid in session metadata";
                logger.error("{} - Metadata: {}", errorMsg, metadata);
                throw new Exception(errorMsg);
            }
            
            Long trainId;
            try {
                trainId = Long.parseLong(trainIdStr);
            } catch (NumberFormatException e) {
                String errorMsg = "Invalid trainId format: " + trainIdStr;
                logger.error(errorMsg, e);
                throw new Exception(errorMsg, e);
            }
            
            logger.info("Looking up train with ID: {}", trainId);
            Train train = trainRepo.findById(trainId)
                .orElseThrow(() -> {
                    String errorMsg = "Train not found with ID: " + trainId;
                    logger.error(errorMsg);
                    return new Exception(errorMsg);
                });

            // Validate and get userId
            String userIdStr = metadata.get("userId");
            if (userIdStr == null || userIdStr.equals("null") || userIdStr.trim().isEmpty()) {
                String errorMsg = "User ID is missing or invalid in session metadata";
                logger.error("{} - Metadata: {}", errorMsg, metadata);
                throw new Exception(errorMsg);
            }
            Long userId = Long.parseLong(userIdStr);
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new Exception("User not found with ID: " + userId));

            // Parse seatIds with better error handling
            String seatIdsJson = metadata.get("seatIds");
            if (seatIdsJson == null || seatIdsJson.equals("null") || seatIdsJson.trim().isEmpty()) {
                String errorMsg = "seatIds is missing or invalid in session metadata";
                logger.error("{} - Metadata: {}", errorMsg, metadata);
                throw new Exception(errorMsg);
            }
            
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            
            List<Long> seatIds = new ArrayList<>();
            try {
                // Try parsing as JSON array first
                if (seatIdsJson.trim().startsWith("[")) {
                    seatIds = objectMapper.readValue(seatIdsJson, new TypeReference<List<Long>>() {});
                } else {
                    // Handle single ID case
                    try {
                        Long singleSeatId = Long.parseLong(seatIdsJson.trim());
                        seatIds.add(singleSeatId);
                    } catch (NumberFormatException e) {
                        throw new Exception("Invalid seat ID format: " + seatIdsJson);
                    }
                }
                logger.info("Parsed seat IDs: {}", seatIds);
            } catch (Exception e) {
                String errorMsg = "Failed to parse seatIds: " + seatIdsJson + ". Error: " + e.getMessage();
                logger.error(errorMsg, e);
                throw new Exception(errorMsg, e);
            }
            
            if (seatIds == null || seatIds.isEmpty()) {
                String errorMsg = "No seat IDs provided";
                logger.error(errorMsg);
                throw new Exception(errorMsg);
            }
            
            logger.info("Looking up seats with IDs: {}", seatIds);
            List<Seat> seats = seatRepo.findAllById(seatIds);
            if (seats.size() != seatIds.size()) {
                String errorMsg = "Some seats not found. Requested: " + seatIds + ", Found: " + 
                    seats.stream().map(Seat::getId).collect(Collectors.toList());
                logger.error(errorMsg);
                throw new Exception(errorMsg);
            }

            Booking newBooking = new Booking();
            newBooking.setTrain(train);
            newBooking.setUser(user);
            newBooking.setSeats(seats);
            newBooking.setTravelDate(LocalDate.parse(metadata.get("travelDate")));
            newBooking.setBookingTime(LocalDateTime.now());
            newBooking.setBookingStatus(Booking.BookingStatus.CONFIRMED);
            newBooking.setPnr(generatePNR());
            newBooking.setSeatClass(metadata.get("seatClass"));
            newBooking.setUserEmail(user.getEmail());
            newBooking.setFromStation(metadata.get("fromStation"));
            newBooking.setToStation(metadata.get("toStation"));
            newBooking.setStripeSessionId(sessionId);

            Booking savedBooking = bookingRepo.save(newBooking);

            List<PassengerDto> passengerDtos;
            String passengersJson = metadata.get("passengers");
            if (passengersJson == null) {
                throw new Exception("Passenger data is missing from session metadata.");
            }
            try {
                passengerDtos = objectMapper.readValue(passengersJson, new TypeReference<>() {});
            } catch (JsonProcessingException e) {
                logger.error("Failed to parse passenger JSON: {}", passengersJson, e);
                throw new Exception("Failed to parse passenger data.");
            }
            List<Passenger> passengerEntities = passengerDtos.stream().map(dto -> {
                Passenger p = new Passenger();
                p.setName(dto.getName());
                p.setAge(dto.getAge());
                p.setGender(dto.getGender());
                p.setPhone(dto.getPhone());
                p.setSeatId(dto.getSeatId());
                p.setBooking(savedBooking);
                p.setAadhaar(dto.getAadhaar());
                return p;
            }).toList();

            passengerRepo.saveAll(passengerEntities);
            savedBooking.setPassengers(passengerEntities);

            Map<String, Object> response = new HashMap<>();
            response.put("booking", savedBooking);
            response.put("train", train);

            return response;

        } catch (StripeException e) {
            throw new Exception("Stripe API error: " + e.getMessage());
        }
    }

    public void cancelBooking(String pnr, String userEmail) {
        logger.info("Attempting to cancel booking PNR: {} by user: {}", pnr, userEmail);
        
        Booking booking = bookingRepo.findByPnr(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with PNR: " + pnr));

        logger.info("Found booking - Owner: {}, Requester: {}", booking.getUserEmail(), userEmail);

        // Security check: Only booking owner can cancel
        if (!booking.getUserEmail().equals(userEmail)) {
            logger.warn("Unauthorized cancellation attempt - PNR: {}, Owner: {}, Requester: {}", 
                pnr, booking.getUserEmail(), userEmail);
            throw new SecurityException("You are not authorized to cancel this booking");
        }

        // Make seats available again
        booking.getSeats().forEach(seat -> {
            seat.setAvailable(true);
            seat.setBooked(false);
        });
        seatRepo.saveAll(booking.getSeats());

        // Update booking status
        booking.setBookingStatus(Booking.BookingStatus.CANCELLED);
        bookingRepo.save(booking);
        
        logger.info("Booking cancelled successfully - PNR: {}", pnr);
    }
}
