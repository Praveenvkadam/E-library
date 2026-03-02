package com.subscriptionpayment.subscriptionpayment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentVerificationDTO {

    @NotBlank(message = "razorpayOrderId is required")
    private String razorpayOrderId;

    @NotBlank(message = "razorpayPaymentId is required")
    private String razorpayPaymentId;

    @NotBlank(message = "razorpaySignature is required")
    private String razorpaySignature;

    @NotBlank(message = "userId is required")
    private String userId;
}
