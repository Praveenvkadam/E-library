package com.subscriptionpayment.subscriptionpayment.dto;

import com.subscriptionpayment.subscriptionpayment.model.SubscriptionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SubscriptionResponseDTO {

    private Long subscriptionId;
    private String userId;
    private String planType;
    private SubscriptionStatus status;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;

    private Boolean isActive;
    private Long daysRemaining;
}
