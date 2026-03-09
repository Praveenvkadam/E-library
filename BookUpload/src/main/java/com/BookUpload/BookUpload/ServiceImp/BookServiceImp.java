package com.BookUpload.BookUpload.ServiceImp;

import com.BookUpload.BookUpload.DTO.BookRequest;
import com.BookUpload.BookUpload.DTO.BookResponce;
import com.BookUpload.BookUpload.Entity.Book;
import com.BookUpload.BookUpload.Repo.BookRepo;
import com.BookUpload.BookUpload.Service.BookService;
import com.BookUpload.BookUpload.kafka.BookEvent;
import com.BookUpload.BookUpload.kafka.BookEventProducer;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class BookServiceImp implements BookService {

    @Autowired
    private BookRepo bookRepo;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private BookEventProducer bookEventProducer;

    // =========================================================================
    // CLOUDINARY HELPERS
    // =========================================================================

    private String uploadToCloudinary(MultipartFile file, String resourceType) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File must not be null or empty");
        }
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("resource_type", resourceType, "folder", "BookUpload")
            );
            if (result == null || result.get("secure_url") == null) {
                throw new RuntimeException("Cloudinary did not return a secure URL");
            }
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary: " + e.getMessage(), e);
        }
    }

    private String extractPublicId(String url) {
        if (url == null || url.isBlank()) throw new RuntimeException("URL must not be null or blank");
        String[] parts = url.split("/upload/");
        if (parts.length < 2) throw new RuntimeException("Invalid Cloudinary URL: " + url);
        String withoutVersion = parts[1].replaceFirst("^v\\d+/", "");
        int dotIndex = withoutVersion.lastIndexOf('.');
        return dotIndex != -1 ? withoutVersion.substring(0, dotIndex) : withoutVersion;
    }

    private void deleteFromCloudinary(String url, String resourceType) {
        if (url == null || url.isBlank()) return;
        try {
            cloudinary.uploader().destroy(extractPublicId(url),
                    ObjectUtils.asMap("resource_type", resourceType));
        } catch (IOException e) {
            // Log but don't throw — don't fail the whole operation over a cleanup issue
            log.warn("Could not delete Cloudinary file {}: {}", url, e.getMessage());
        }
    }

    // =========================================================================
    // MAPPING HELPERS
    // =========================================================================

    private BookResponce mapToResponse(Book book) {
        if (book == null) throw new RuntimeException("Cannot map null Book to response");
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

    private void updateBookFields(Book book, BookRequest request) {
        book.setB_name(request.B_name());
        book.setB_author(request.B_author());
        book.setB_description(request.B_description());
        book.setReleaseDate(request.releaseDate());
        book.setB_Category(request.B_Category());
        book.setB_Language(request.B_Language());
    }

    private BookEvent buildEvent(Book book, String eventType) {
        return BookEvent.builder()
                .bookId(book.getB_id())
                .bookName(book.getB_name())
                .author(book.getB_author())
                .category(book.getB_Category())
                .language(book.getB_Language())
                .imageUrl(book.getB_imageUrl())
                .pdfUrl(book.getB_pdfUrl())
                .eventType(eventType)
                .eventTime(LocalDateTime.now())
                .build();
    }

    // =========================================================================
    // SAFE KAFKA PUBLISH — never lets Kafka failure break the main operation
    // =========================================================================

    private void safePublish(BookEvent event) {
        try {
            bookEventProducer.publish(event);
        } catch (Exception e) {
            // Kafka down or misconfigured — log the warning but DO NOT throw.
            // The book is already saved/deleted/updated in the DB.
            // Kafka events are best-effort; they must not roll back DB operations.
            log.warn("Kafka publish failed for event [{}] bookId={} — reason: {}",
                    event.getEventType(), event.getBookId(), e.getMessage());
        }
    }

    // =========================================================================
    // UPLOAD
    // =========================================================================

    @Override
    @Transactional
    public BookResponce BookUpload(BookRequest bookRequest,
                                   MultipartFile imageFile,
                                   MultipartFile pdfFile) {
        if (bookRequest == null) throw new RuntimeException("BookRequest must not be null");

        String imageUrl = uploadToCloudinary(imageFile, "image");
        String pdfUrl   = uploadToCloudinary(pdfFile,   "raw");

        try {
            Book book = Book.builder()
                    .B_name(bookRequest.B_name())
                    .B_author(bookRequest.B_author())
                    .B_description(bookRequest.B_description())
                    .B_imageUrl(imageUrl)
                    .B_pdfUrl(pdfUrl)
                    .releaseDate(bookRequest.releaseDate())
                    .B_Category(bookRequest.B_Category())
                    .B_Language(bookRequest.B_Language())
                    .build();

            Book saved = bookRepo.save(book);

            // Safe publish — Kafka failure will NOT cause a 500
            safePublish(buildEvent(saved, "BOOK_UPLOADED"));

            return mapToResponse(saved);

        } catch (Exception e) {
            // DB save failed — rollback Cloudinary uploads
            deleteFromCloudinary(imageUrl, "image");
            deleteFromCloudinary(pdfUrl, "raw");
            throw new RuntimeException("Failed to save book: " + e.getMessage(), e);
        }
    }

    // =========================================================================
    // DELETE
    // =========================================================================

    @Override
    @Transactional
    public BookResponce BookDelete(Long bookId) {
        if (bookId == null) throw new RuntimeException("Book ID must not be null");

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        BookResponce response = mapToResponse(book);
        BookEvent event = buildEvent(book, "BOOK_DELETED");

        deleteFromCloudinary(book.getB_imageUrl(), "image");
        deleteFromCloudinary(book.getB_pdfUrl(), "raw");

        bookRepo.deleteById(bookId);

        // Safe publish — Kafka failure will NOT cause a 500
        safePublish(event);

        return response;
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    @Override
    @Transactional
    public BookResponce BookUpdate(Long bookId,
                                   BookRequest bookRequest,
                                   MultipartFile imageFile,
                                   MultipartFile pdfFile) {
        if (bookId == null)      throw new RuntimeException("Book ID must not be null");
        if (bookRequest == null) throw new RuntimeException("BookRequest must not be null");

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        updateBookFields(book, bookRequest);

        if (imageFile != null && !imageFile.isEmpty()) {
            String oldImageUrl = book.getB_imageUrl();
            book.setB_imageUrl(uploadToCloudinary(imageFile, "image"));
            deleteFromCloudinary(oldImageUrl, "image");
        }

        if (pdfFile != null && !pdfFile.isEmpty()) {
            String oldPdfUrl = book.getB_pdfUrl();
            book.setB_pdfUrl(uploadToCloudinary(pdfFile, "raw"));
            deleteFromCloudinary(oldPdfUrl, "raw");
        }

        Book updated = bookRepo.save(book);

        // Safe publish — Kafka failure will NOT cause a 500
        safePublish(buildEvent(updated, "BOOK_UPDATED"));

        return mapToResponse(updated);
    }

    // =========================================================================
    // QUERIES
    // =========================================================================

    @Override
    public List<BookResponce> findAll() {
        return bookRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookResponce> searchBooks(String B_name, String B_author,
                                          Date releaseDate, String B_Category,
                                          String B_Language) {
        String name     = (B_name     != null && !B_name.isBlank())     ? B_name     : null;
        String author   = (B_author   != null && !B_author.isBlank())   ? B_author   : null;
        String category = (B_Category != null && !B_Category.isBlank()) ? B_Category : null;

        return bookRepo.searchBooks(name, author, releaseDate, category)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}