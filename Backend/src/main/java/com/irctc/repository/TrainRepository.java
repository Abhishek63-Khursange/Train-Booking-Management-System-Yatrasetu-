package com.irctc.repository;

import com.irctc.model.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainRepository extends JpaRepository<Train, Long> {
    @Query("SELECT t FROM Train t WHERE " +
           "LOWER(t.fromStation) = LOWER(:source) AND " +
           "LOWER(t.toStation) = LOWER(:destination) AND " +
           "(t.runningDays = :dayCode OR " +
           "t.runningDays LIKE CONCAT(:dayCode, ',%') OR " +
           "t.runningDays LIKE CONCAT('%,', :dayCode) OR " +
           "t.runningDays LIKE CONCAT('%,', :dayCode, ',%'))")
    List<Train> findTrainsByDay(@Param("source") String source,
                                @Param("destination") String destination,
                                @Param("dayCode") String dayCode);
    
    // This method is not needed as it's implemented in TrainService
}