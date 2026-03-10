package com.user.UserProfile.Kafka;

import com.user.UserProfile.DTO.ProfileEventDTO;
import com.user.UserProfile.Service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.kafka.bootstrap-servers")
public class ProfileEventConsumer {

    private final ProfileService profileService;

    // Consumes from Authentication service — auto-creates profile on registration
    @KafkaListener(
            topics = "${kafka.topic.user-registered}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeUserRegistered(
            @Payload ProfileEventDTO event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment ack) {
        try {
            log.info("📥 USER_REGISTERED received → userId: [{}] partition: [{}] offset: [{}]",
                    event.getUserId(), partition, offset);
            profileService.createProfile(event);
            ack.acknowledge();
        } catch (Exception ex) {
            log.error("❌ Failed to process USER_REGISTERED for userId: [{}] → {}",
                    event.getUserId(), ex.getMessage());
            // Don't ack → will retry based on consumer config
        }
    }
}