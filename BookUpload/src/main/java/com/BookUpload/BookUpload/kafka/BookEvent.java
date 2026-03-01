package com.BookUpload.BookUpload.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookEvent {
    private Long bookId;
    private String bookName;
    private String author;
    private String category;
    private String language;
    private String imageUrl;
    private String pdfUrl;
    private String eventType;
    private LocalDateTime eventTime;
}