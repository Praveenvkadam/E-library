package com.user.UserProfile.Kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaEventDispatcher {

    @Async("kafkaTaskExecutor")
    public void dispatch(Runnable sender, String eventType, String userId) {
        try {
            sender.run();
            log.info("📨 Kafka event sent [{}] → userId: [{}]", eventType, userId);
        } catch (Exception e) {
            log.warn("⚠️ Kafka event failed [{}] → userId: [{}] reason: {}",
                    eventType, userId, e.getMessage());
        }
    }
}