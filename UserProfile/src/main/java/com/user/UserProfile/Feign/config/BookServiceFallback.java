package com.user.UserProfile.Feign.config;

import com.user.UserProfile.Feign.BookServiceClient;
import com.user.UserProfile.Feign.dto.BookResponce;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class BookServiceFallback implements BookServiceClient {

    @Override
    public BookResponce getBook(Long bookId) {
        log.warn("⚠️ BookUpload down — fallback for bookId: [{}]", bookId);
        return new BookResponce(bookId, "Unavailable", "Unavailable",
                "Unavailable", null, null, null, "Unknown", "Unknown");
    }

    @Override
    public List<BookResponce> getBooksByIds(List<Long> ids) {
        log.warn("⚠️ BookUpload down — fallback for batch ids: {}", ids);
        return Collections.emptyList();
    }

    @Override
    public List<BookResponce> getAllBooks() {
        log.warn("⚠️ BookUpload down — fallback for getAllBooks");
        return Collections.emptyList();
    }

    @Override
    public List<BookResponce> getBooksByCategory(String category) {
        log.warn("⚠️ BookUpload down — fallback for category: [{}]", category);
        return Collections.emptyList();
    }

    @Override
    public List<BookResponce> searchBooks(String query) {
        log.warn("⚠️ BookUpload down — fallback for query: [{}]", query);
        return Collections.emptyList();
    }
}