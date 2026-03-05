package com.user.UserProfile.Kafka;

import com.user.UserProfile.DTO.ProfileEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileEventProducer {

    private final KafkaTemplate<String, ProfileEventDTO> kafkaTemplate;

    @Value("${kafka.topic.profile-created}")
    private String profileCreatedTopic;

    @Value("${kafka.topic.profile-updated}")
    private String profileUpdatedTopic;

    @Value("${kafka.topic.profile-deleted}")
    private String profileDeletedTopic;

    public void sendProfileCreated(ProfileEventDTO event) {
        sendEvent(profileCreatedTopic, event);
    }

    public void sendProfileUpdated(ProfileEventDTO event) {
        sendEvent(profileUpdatedTopic, event);
    }

    public void sendProfileDeleted(ProfileEventDTO event) {
        sendEvent(profileDeletedTopic, event);
    }

    private void sendEvent(String topic, ProfileEventDTO event) {
        CompletableFuture<SendResult<String, ProfileEventDTO>> future =
                kafkaTemplate.send(topic, event.getUserId(), event);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("❌ Failed to send event [{}] to topic [{}]: {}",
                        event.getEventType(), topic, ex.getMessage());
            } else {
                log.info("✅ Event [{}] sent to topic [{}] partition [{}] offset [{}]",
                        event.getEventType(),
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }
}