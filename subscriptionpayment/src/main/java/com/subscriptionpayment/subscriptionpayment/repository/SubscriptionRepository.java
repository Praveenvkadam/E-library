package com.subscriptionpayment.subscriptionpayment.repository;

import com.subscriptionpayment.subscriptionpayment.model.Subscription;
import com.subscriptionpayment.subscriptionpayment.model.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Subscription> findTopByUserIdOrderByCreatedAtDesc(String userId);

    List<Subscription> findByStatusAndEndDateBefore(
            SubscriptionStatus status, LocalDateTime dateTime);

    long countByStatus(SubscriptionStatus status);

    long countByUserId(String userId);

    Page<Subscription> findByStatus(SubscriptionStatus status, Pageable pageable);

    @Modifying
    @Query("UPDATE Subscription s SET s.status = :newStatus, s.updatedAt = :now " +
            "WHERE s.id IN :ids")
    int bulkUpdateStatus(
            @Param("ids")       List<Long>          ids,
            @Param("newStatus") SubscriptionStatus  newStatus,
            @Param("now")       LocalDateTime       now);

    @Query("SELECT COUNT(s) > 0 FROM Subscription s " +
            "WHERE s.userId = :userId " +
            "AND s.status = 'ACTIVE' " +
            "AND s.endDate > :now")
    boolean hasActiveSubscription(
            @Param("userId") String        userId,
            @Param("now")    LocalDateTime now);
}
