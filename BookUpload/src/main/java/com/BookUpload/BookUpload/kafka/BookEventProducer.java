package com.BookUpload.BookUpload.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookEventProducer {

    private final KafkaTemplate<String, BookEvent> kafkaTemplate;

    @Value("${kafka.topic.book-events}")
    private String topic;

    /**
     * Publishes a BookEvent to Kafka.
     *
     * This method NEVER throws — if Kafka is down or misconfigured it logs a
     * warning and returns normally so the caller's DB operation is not affected.
     *
     * Two failure modes are handled:
     *   1. Synchronous — kafkaTemplate.send() itself throws (broker unreachable,
     *      producer not initialized, topic doesn't exist yet, etc.)
     *   2. Asynchronous — the broker accepts the send but later acks with error
     *      (handled by whenComplete callback)
     */
    public void publish(BookEvent event) {
        try {
            kafkaTemplate.send(topic, String.valueOf(event.getBookId()), event)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("[Kafka] Published: {} | bookId={}",
                                    event.getEventType(), event.getBookId());
                        } else {
                            // Async failure — broker rejected after accepting
                            log.warn("[Kafka] Async send failed: {} | bookId={} | reason: {}",
                                    event.getEventType(), event.getBookId(), ex.getMessage());
                        }
                    });

        } catch (Exception e) {
            // Synchronous failure — kafkaTemplate.send() threw before returning Future
            // This happens when: Kafka broker is down, topic missing, producer misconfigured
            // We log and return — the book is already saved in DB, Kafka is best-effort
            log.warn("[Kafka] Sync send failed: {} | bookId={} | reason: {}",
                    event.getEventType(), event.getBookId(), e.getMessage());
        }
    }
}