package com.subscriptionpayment.subscriptionpayment.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private static final int MONTHLY_AMOUNT_PAISE = 9900;
    private static final int YEARLY_AMOUNT_PAISE  = 99900;

    @Async("subscriptionTaskExecutor")
    public CompletableFuture<String> createOrderAsync(String planType) {
        try {
            int amount = "YEARLY".equalsIgnoreCase(planType)
                    ? YEARLY_AMOUNT_PAISE
                    : MONTHLY_AMOUNT_PAISE;

            JSONObject options = new JSONObject();
            options.put("amount",          amount);
            options.put("currency",        "INR");
            options.put("receipt",         "rcpt_" + System.currentTimeMillis());
            options.put("payment_capture", 1);

            Order order  = razorpayClient.orders.create(options);
            String orderId = order.get("id").toString();

            log.info("[{}] Razorpay order created: {} | plan: {} | amount: {}p",
                    Thread.currentThread().getName(), orderId, planType, amount);

            return CompletableFuture.completedFuture(orderId);

        } catch (RazorpayException e) {
            log.error("[{}] Failed to create Razorpay order: {}",
                    Thread.currentThread().getName(), e.getMessage());
            CompletableFuture<String> failed = new CompletableFuture<>();
            failed.completeExceptionally(
                    new RuntimeException("Razorpay order creation failed: " + e.getMessage(), e));
            return failed;
        }
    }


    @Async("subscriptionTaskExecutor")
    public CompletableFuture<Boolean> verifySignatureAsync(
            String orderId, String paymentId, String signature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id",   orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature",  signature);

            Utils.verifyPaymentSignature(attributes, keySecret);

            log.info("[{}] Signature verified ✓ for orderId: {}",
                    Thread.currentThread().getName(), orderId);
            return CompletableFuture.completedFuture(true);

        } catch (RazorpayException e) {
            log.warn("[{}] Signature INVALID for orderId: {}",
                    Thread.currentThread().getName(), orderId);
            return CompletableFuture.completedFuture(false);
        }
    }
}
