package com.user.UserProfile.Kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@ConditionalOnProperty(
        name = "spring.kafka.admin.auto-create",
        havingValue = "true",
        matchIfMissing = true
)
public class KafkaTopicConfig {

    @Value("${kafka.topic.profile-created}")
    private String profileCreatedTopic;

    @Value("${kafka.topic.profile-updated}")
    private String profileUpdatedTopic;

    @Value("${kafka.topic.profile-deleted}")
    private String profileDeletedTopic;

    @Value("${kafka.topic.user-registered}")
    private String userRegisteredTopic;

    @Bean
    public NewTopic profileCreatedTopic() {
        return TopicBuilder.name(profileCreatedTopic).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic profileUpdatedTopic() {
        return TopicBuilder.name(profileUpdatedTopic).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic profileDeletedTopic() {
        return TopicBuilder.name(profileDeletedTopic).partitions(3).replicas(1).build();
    }

    // Listen-only — produced by Authentication service
    @Bean
    public NewTopic userRegisteredTopic() {
        return TopicBuilder.name(userRegisteredTopic).partitions(3).replicas(1).build();
    }
}