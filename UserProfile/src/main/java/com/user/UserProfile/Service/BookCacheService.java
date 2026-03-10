package com.user.UserProfile.Service;

import com.user.UserProfile.Feign.BookServiceClient;
import com.user.UserProfile.Feign.dto.BookResponce;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookCacheService {

    private final BookServiceClient bookServiceClient;

    // ✅ Spring proxy properly intercepts this — cache actually works
    @Cacheable(value = "books", key = "#ids.toString()")
    public Map<Long, BookResponce> fetchBookMap(List<Long> ids) {
        if (ids.isEmpty()) return Map.of();
        try {
            log.debug("📚 Feign batch call → fetching {} books", ids.size());
            return bookServiceClient.getBooksByIds(ids).stream()
                    .collect(Collectors.toMap(BookResponce::B_id, b -> b));
        } catch (Exception e) {
            log.warn("⚠️ Batch book fetch failed → {}", e.getMessage());
            return Map.of();
        }
    }
}