package com.BookUpload.BookUpload.Service;

import com.BookUpload.BookUpload.DTO.BookRequest;
import com.BookUpload.BookUpload.DTO.BookResponce;
import com.BookUpload.BookUpload.Entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.concurrent.CompletableFuture;

public interface BookService {

    CompletableFuture<BookResponce> BookUploadAsync(BookRequest bookRequest, MultipartFile imageFile, MultipartFile pdfFile);

    CompletableFuture<BookResponce> BookUpdateAsync(Long bookId, BookRequest bookRequest, MultipartFile imageFile, MultipartFile pdfFile);

    BookResponce BookDelete(Long bookId);

    // Returns the raw Book entity — used by the PDF proxy endpoint to get the Cloudinary URL
    Book findById(Long bookId);

    Page<BookResponce> findAll(Pageable pageable);

    Page<BookResponce> searchBooks(String B_name, String B_author, Date releaseDate, String B_Category, String B_Language, Pageable pageable);
}