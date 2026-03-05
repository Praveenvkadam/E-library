package com.user.UserProfile.Kafka;

import com.user.UserProfile.DTO.ProfileEventDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ProfileEventConsumer {

    @KafkaListener(
            topics = "${kafka.topic.profile-created}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeProfileCreated(ProfileEventDTO event) {
        log.info("📥 Profile CREATED event received → userId: [{}] email: [{}] time: [{}]",
                event.getUserId(), event.getEmail(), event.getEventTime());
        // e.g. notify MailService, BookUpload, etc.
    }

    @KafkaListener(
            topics = "${kafka.topic.profile-updated}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeProfileUpdated(ProfileEventDTO event) {
        log.info("📥 Profile UPDATED event received → userId: [{}] time: [{}]",
                event.getUserId(), event.getEventTime());
        // e.g. sync changes to subscription service
    }

    @KafkaListener(
            topics = "${kafka.topic.profile-deleted}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeProfileDeleted(ProfileEventDTO event) {
        log.info("📥 Profile DELETED event received → userId: [{}] time: [{}]",
                event.getUserId(), event.getEventTime());
        // e.g. cancel subscription, clear book history
    }
}