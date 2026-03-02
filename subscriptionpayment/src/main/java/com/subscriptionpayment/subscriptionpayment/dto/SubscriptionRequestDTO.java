package com.subscriptionpayment.subscriptionpayment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SubscriptionRequestDTO {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "planType is required")
    @Pattern(
            regexp = "MONTHLY|YEARLY",
            message = "planType must be MONTHLY or YEARLY"
    )
    private String planType;
}
