package com.BookUpload.BookUpload.Service;

import com.BookUpload.BookUpload.DTO.BookRequest;
import com.BookUpload.BookUpload.DTO.BookResponce;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.concurrent.CompletableFuture;

public interface BookService {

    // Async — returns immediately, upload runs in background thread
    CompletableFuture<BookResponce> BookUploadAsync(BookRequest bookRequest, MultipartFile imageFile, MultipartFile pdfFile);

    // Async — returns immediately, update runs in background thread
    CompletableFuture<BookResponce> BookUpdateAsync(Long bookId, BookRequest bookRequest, MultipartFile imageFile, MultipartFile pdfFile);

    // Delete is fast (no file I/O on the request thread) — stays synchronous
    BookResponce BookDelete(Long bookId);

    // Paginated — no longer loads entire table into memory
    Page<BookResponce> findAll(Pageable pageable);

    // Paginated search
    Page<BookResponce> searchBooks(String B_name, String B_author, Date releaseDate, String B_Category, String B_Language, Pageable pageable);
}