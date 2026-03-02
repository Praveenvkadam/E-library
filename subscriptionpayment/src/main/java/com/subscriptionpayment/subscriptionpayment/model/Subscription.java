package com.subscriptionpayment.subscriptionpayment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

 import jakarta.persistence.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "subscriptions", indexes = {
        @Index(name = "idx_subscriptions_user_id",  columnList = "userId"),
        @Index(name = "idx_subscriptions_status",   columnList = "status"),
        @Index(name = "idx_subscriptions_end_date", columnList = "endDate")
})
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String userId;

    @Column(nullable = false, length = 20)
    private String planType;               

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionStatus status;

    @Column(unique = true, length = 100)
    private String razorpayOrderId;

    @Column(length = 100)
    private String razorpayPaymentId;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = SubscriptionStatus.PENDING;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
