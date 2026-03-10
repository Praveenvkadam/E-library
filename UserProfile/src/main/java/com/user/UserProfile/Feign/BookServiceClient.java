package com.user.UserProfile.Feign;

import com.user.UserProfile.Feign.config.BookServiceFallback;
import com.user.UserProfile.Feign.dto.BookResponce;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
        name = "BookUpload",
        path = "/api/books",
        fallback = BookServiceFallback.class
)
public interface BookServiceClient {

    @GetMapping("/{bookId}")
    BookResponce getBook(@PathVariable("bookId") Long bookId);

    // ✅ Batch endpoint — avoids N+1 Feign calls
    @GetMapping("/batch")
    List<BookResponce> getBooksByIds(@RequestParam("ids") List<Long> ids);

    @GetMapping
    List<BookResponce> getAllBooks();

    @GetMapping("/category/{category}")
    List<BookResponce> getBooksByCategory(@PathVariable("category") String category);

    @GetMapping("/search")
    List<BookResponce> searchBooks(@RequestParam("query") String query);
}