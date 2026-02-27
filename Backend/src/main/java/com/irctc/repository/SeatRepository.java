package com.irctc.repository;

import com.irctc.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByCoachId(Long coachId);

    List<Seat> findByCoachIdAndAvailableTrue(Long coachId);
    
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.coach.id = :coachId AND s.available = true")
    int countByCoachIdAndAvailableTrue(@Param("coachId") Long coachId);

    List<Seat> findByCoachIdAndAvailableFalse(Long coachId);

    List<Seat> findByCoach_CoachNumberAndCoach_Train_Id(String coachNumber, Long trainId);

    boolean existsByIdAndAvailableTrue(Long seatId);
    
    @Query("SELECT s.coach.id, s.id, s.seatNumber, s.booked " +
           "FROM Seat s WHERE s.coach.train.id = :trainId " +
           "ORDER BY s.coach.id, s.seatNumber")
    List<Object[]> findSeatLayoutsByTrainId(@Param("trainId") Long trainId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id IN :ids")
    List<Seat> findAllByIdForUpdate(@Param("ids") List<Long> ids);
}