package com.user.UserProfile.Repository;

import com.user.UserProfile.Entity.Profile;
import com.user.UserProfile.Entity.ReadingHistory;
import com.user.UserProfile.Entity.ReadingHistory.ReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, String> {

    Optional<ReadingHistory> findByProfileAndBookId(Profile profile, String bookId);

    List<ReadingHistory> findByProfile(Profile profile);

    List<ReadingHistory> findByProfileAndStatus(Profile profile, ReadStatus status);

    boolean existsByProfileAndBookId(Profile profile, String bookId);

    @Query("SELECT COUNT(r) FROM ReadingHistory r WHERE r.profile.userId = :userId AND r.status = :status")
    int countByUserIdAndStatus(@Param("userId") String userId, @Param("status") ReadStatus status);

    @Query("SELECT r FROM ReadingHistory r WHERE r.profile.userId = :userId ORDER BY r.lastReadAt DESC")
    List<ReadingHistory> findRecentByUserId(@Param("userId") String userId);

    void deleteAllByProfile(Profile profile);
}