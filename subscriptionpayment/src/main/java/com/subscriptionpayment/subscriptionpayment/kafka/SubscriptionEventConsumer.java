package com.subscriptionpayment.subscriptionpayment.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.subscriptionpayment.subscriptionpayment.model.Subscription;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SubscriptionEventConsumer {

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(
            topics           = "${kafka.topic.subscription-events:subscription-events}",
            groupId          = "${spring.kafka.consumer.group-id:subscription-group}",
            concurrency      = "3",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleSubscriptionActivated(
            @Payload String message) {

        try {
            Subscription subscription = objectMapper.readValue(message, Subscription.class);

            log.info("[{}] Received event | userId: {} | plan: {} | status: {}",
                    Thread.currentThread().getName(),
                    subscription.getUserId(),
                    subscription.getPlanType(),
                    subscription.getStatus());

            processEvent(subscription);



        } catch (JsonProcessingException e) {
            log.error("[{}] Failed to deserialize message: {} | raw: {}",
                    Thread.currentThread().getName(), e.getMessage(), message);


        } catch (Exception e) {
            log.error("[{}] Consumer processing failed: {}",
                    Thread.currentThread().getName(), e.getMessage());
        }
    }

    private void processEvent(Subscription subscription) {
        log.info("[{}] Processing subscription for userId: {}",
                Thread.currentThread().getName(), subscription.getUserId());
    }
}
