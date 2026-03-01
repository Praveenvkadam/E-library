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

    public void publish(BookEvent event) {
        kafkaTemplate.send(topic, String.valueOf(event.getBookId()), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("[Kafka] Published: {} | bookId={}",
                                event.getEventType(), event.getBookId());
                    } else {
                        log.error("[Kafka]  Failed: {}", ex.getMessage());
                    }
                });
    }
}
