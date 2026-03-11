package com.BookUpload.BookUpload.ServiceImp;

import com.BookUpload.BookUpload.DTO.BookRequest;
import com.BookUpload.BookUpload.DTO.BookResponce;
import com.BookUpload.BookUpload.Entity.Book;
import com.BookUpload.BookUpload.Repo.BookRepo;
import com.BookUpload.BookUpload.Service.BookService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final Cloudinary cloudinary;
    private final BookRepo   bookRepo;

    // =========================================================================
    // UPLOAD
    // =========================================================================
    @Override
    @Async
    public CompletableFuture<BookResponce> BookUploadAsync(
            BookRequest bookRequest,
            MultipartFile imageFile,
            MultipartFile pdfFile
    ) {
        try {
            String imageUrl = uploadToCloudinary(imageFile, "books/images", "image");
            String pdfUrl   = uploadToCloudinary(pdfFile,   "books/pdfs",   "raw");

            Book book = new Book();
            book.setB_name(bookRequest.B_name());
            book.setB_author(bookRequest.B_author());
            book.setB_description(bookRequest.B_description());
            book.setB_imageUrl(imageUrl);
            book.setB_pdfUrl(pdfUrl);
            book.setReleaseDate(bookRequest.releaseDate());
            book.setB_Category(bookRequest.B_Category());
            book.setB_Language(bookRequest.B_Language());

            Book saved = bookRepo.save(book);

            log.info("Upload complete for book: {}", saved.getB_name());
            return CompletableFuture.completedFuture(mapToResponse(saved));

        } catch (Exception e) {
            log.error("Async upload failed: {}", e.getMessage());
            CompletableFuture<BookResponce> failed = new CompletableFuture<>();
            failed.completeExceptionally(e);
            return failed;
        }
    }

    // =========================================================================
    // UPDATE
    // =========================================================================
    @Override
    @Async
    public CompletableFuture<BookResponce> BookUpdateAsync(
            Long bookId,
            BookRequest bookRequest,
            MultipartFile imageFile,
            MultipartFile pdfFile
    ) {
        try {
            Book book = bookRepo.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));

            // Only re-upload to Cloudinary if a new file was provided
            if (imageFile != null && !imageFile.isEmpty()) {
                book.setB_imageUrl(uploadToCloudinary(imageFile, "books/images", "image"));
            }
            if (pdfFile != null && !pdfFile.isEmpty()) {
                book.setB_pdfUrl(uploadToCloudinary(pdfFile, "books/pdfs", "raw"));
            }

            book.setB_name(bookRequest.B_name());
            book.setB_author(bookRequest.B_author());
            book.setB_description(bookRequest.B_description());
            book.setReleaseDate(bookRequest.releaseDate());
            book.setB_Category(bookRequest.B_Category());
            book.setB_Language(bookRequest.B_Language());

            Book updated = bookRepo.save(book);

            log.info("Update complete for bookId: {}", bookId);
            return CompletableFuture.completedFuture(mapToResponse(updated));

        } catch (Exception e) {
            log.error("Async update failed for bookId {}: {}", bookId, e.getMessage());
            CompletableFuture<BookResponce> failed = new CompletableFuture<>();
            failed.completeExceptionally(e);
            return failed;
        }
    }

    // =========================================================================
    // DELETE
    // =========================================================================
    @Override
    public BookResponce BookDelete(Long bookId) {
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));

        bookRepo.delete(book);
        log.info("Deleted bookId: {}", bookId);
        return mapToResponse(book);
    }

    // =========================================================================
    // FIND ALL — paginated
    // =========================================================================
    @Override
    public Page<BookResponce> findAll(Pageable pageable) {
        return bookRepo.findAll(pageable).map(this::mapToResponse);
    }

    // =========================================================================
    // SEARCH — paginated
    // =========================================================================
    @Override
    public Page<BookResponce> searchBooks(
            String B_name,
            String B_author,
            Date releaseDate,
            String B_Category,
            String B_Language,
            Pageable pageable
    ) {
        return bookRepo.searchBooks(B_name, B_author, releaseDate, B_Category, B_Language, pageable)
                .map(this::mapToResponse);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================
    private String uploadToCloudinary(MultipartFile file, String folder, String resourceType) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder",        folder,
                        "resource_type", resourceType
                )
        );
        return (String) result.get("secure_url");
    }

    private BookResponce mapToResponse(Book book) {
        return new BookResponce(
                book.getB_id(),
                book.getB_name(),
                book.getB_author(),
                book.getB_description(),
                book.getB_imageUrl(),
                book.getB_pdfUrl(),
                book.getReleaseDate(),
                book.getB_Category(),
                book.getB_Language()
        );
    }
}