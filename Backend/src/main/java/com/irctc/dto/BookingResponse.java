package com.irctc.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class BookingResponse {

    private String pnr;
    private String seatClass;
    private LocalDateTime bookingTime;
    private TrainDetails train;
    private List<PassengerInfo> passengers;
    private String status;
    private String message;
    private int remainingSeats;

    public BookingResponse(String pnr, String seatClass, LocalDateTime bookingTime,
                          TrainDetails train, List<PassengerInfo> passengers,
                          String status, String message, int remainingSeats) {
        this.pnr = pnr;
        this.seatClass = seatClass;
        this.bookingTime = bookingTime;
        this.train = train;
        this.passengers = passengers;
        this.status = status;
        this.message = message;
        this.remainingSeats = remainingSeats;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class TrainDetails {
        private String name;
        private String source;
        private String destination;

        public TrainDetails(String name, String source, String destination) {
            this.name = name;
            this.source = source;
            this.destination = destination;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class PassengerInfo {
        private String name;
        private int age;
        private String aadhaar;
        private int seatNumber;


        public PassengerInfo(String name, int age, String aadhaar,int seatNumber) {
            this.name = name;
            this.age = age;
            this.aadhaar = aadhaar;
            this.seatNumber = seatNumber;
        }
    }
}