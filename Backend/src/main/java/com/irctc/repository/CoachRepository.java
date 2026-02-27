package com.irctc.repository;

import com.irctc.model.Coach;
import com.irctc.model.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CoachRepository extends JpaRepository<Coach, Long> {
    List<Coach> findByTrainId(Long trainId);
    List<Coach> findByTrain(Train train);
    
    @Query("SELECT DISTINCT c FROM Coach c LEFT JOIN FETCH c.seats WHERE c.train.id = :trainId")
    List<Coach> findByTrainIdWithSeats(@Param("trainId") Long trainId);
}