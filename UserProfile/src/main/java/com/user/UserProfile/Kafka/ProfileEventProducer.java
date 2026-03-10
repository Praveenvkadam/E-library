package com.user.UserProfile.Kafka;

import com.user.UserProfile.DTO.ProfileEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@ConditionalOnProperty(name = "spring.kafka.bootstrap-servers")
@RequiredArgsConstructor
public class ProfileEventProducer {

    private final KafkaTemplate<String, ProfileEventDTO> kafkaTemplate;

    @Value("${kafka.topic.profile-created}")
    private String profileCreatedTopic;

    @Value("${kafka.topic.profile-updated}")
    private String profileUpdatedTopic;

    @Value("${kafka.topic.profile-deleted}")
    private String profileDeletedTopic;

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void sendProfileCreated(ProfileEventDTO event) {
        sendEvent(profileCreatedTopic, enrich(event, "PROFILE_CREATED"));
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void sendProfileUpdated(ProfileEventDTO event) {
        sendEvent(profileUpdatedTopic, enrich(event, "PROFILE_UPDATED"));
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void sendProfileDeleted(ProfileEventDTO event) {
        sendEvent(profileDeletedTopic, enrich(event, "PROFILE_DELETED"));
    }

    private void sendEvent(String topic, ProfileEventDTO event) {
        if (event.getUserId() == null) {
            log.warn("⚠️ Skipping event [{}] — userId is null", event.getEventType());
            return;
        }

        CompletableFuture<SendResult<String, ProfileEventDTO>> future =
                kafkaTemplate.send(topic, event.getUserId(), event);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("❌ Failed to send [{}] to topic [{}]: {}",
                        event.getEventType(), topic, ex.getMessage());
            } else {
                log.info("✅ [{}] → topic [{}] partition [{}] offset [{}]",
                        event.getEventType(),
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }

    private ProfileEventDTO enrich(ProfileEventDTO event, String eventType) {
        event.setEventType(eventType);
        if (event.getEventTime() == null) event.setEventTime(LocalDateTime.now());
        return event;
    }
}