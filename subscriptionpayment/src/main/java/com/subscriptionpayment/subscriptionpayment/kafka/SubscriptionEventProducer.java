package com.subscriptionpayment.subscriptionpayment.kafka;

import com.subscriptionpayment.subscriptionpayment.model.Subscription;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionEventProducer {

    private final KafkaTemplate<String, Subscription> kafkaTemplate;

    @Value("${kafka.topic.subscription-events:subscription-events}")
    private String topic;

    @Async("subscriptionTaskExecutor")
    public void publishSubscriptionActivatedAsync(Subscription subscription) {
        log.info("[{}] Publishing Kafka event | topic: {} | userId: {}",
                Thread.currentThread().getName(), topic, subscription.getUserId());

        CompletableFuture<SendResult<String, Subscription>> future =
                kafkaTemplate.send(topic, subscription.getUserId(), subscription);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("[{}] Kafka ACK ✓ | offset: {} | userId: {}",
                        Thread.currentThread().getName(),
                        result.getRecordMetadata().offset(),
                        subscription.getUserId());
            } else {
                log.error("[{}] Kafka FAILED ✗ | userId: {} | reason: {}",
                        Thread.currentThread().getName(),
                        subscription.getUserId(),
                        ex.getMessage());
                // TODO: push to dead-letter queue or retry table
            }
        });
    }
}