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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
public class BookServiceImp implements BookService {

    @Autowired private BookRepo          bookRepo;
    @Autowired private Cloudinary        cloudinary;
    @Autowired private BookEventProducer bookEventProducer;

    private final ExecutorService uploadExecutor = Executors.newCachedThreadPool();

    // 5 MB threshold — anything above uses chunked upload
    private static final long CHUNK_THRESHOLD_BYTES = 5 * 1024 * 1024;

    // =========================================================================
    // CLOUDINARY
    // =========================================================================

    private String uploadToCloudinary(byte[] fileBytes, String originalName, String resourceType) {
        if (fileBytes == null || fileBytes.length == 0)
            throw new RuntimeException("File must not be null or empty");

        long startTime = System.currentTimeMillis();
        log.info("[Cloudinary] Starting upload: {} | size: {} KB | type: {}",
                originalName, fileBytes.length / 1024, resourceType);

        try {
            Map<?, ?> result;

            if (fileBytes.length > CHUNK_THRESHOLD_BYTES) {
                // ✅ Chunked upload for large files (>5MB)
                result = cloudinary.uploader().uploadLarge(
                        fileBytes,
                        ObjectUtils.asMap(
                                "resource_type",   resourceType,
                                "folder",          "BookUpload",
                                "use_filename",    true,
                                "unique_filename", true,
                                "overwrite",       false,
                                "chunk_size",      6 * 1024 * 1024  // 6MB chunks
                        )
                );
            } else {
                // ✅ Regular upload for small files (<5MB)
                result = cloudinary.uploader().upload(
                        fileBytes,
                        ObjectUtils.asMap(
                                "resource_type",   resourceType,
                                "folder",          "BookUpload",
                                "use_filename",    true,
                                "unique_filename", true,
                                "overwrite",       false,
                                // ✅ Image optimizations — only applied to images
                                "quality",         resourceType.equals("image") ? "auto:good" : null,
                                "fetch_format",    resourceType.equals("image") ? "auto"       : null
                        )
                );
            }

            if (result == null || result.get("secure_url") == null)
                throw new RuntimeException("Cloudinary did not return a secure URL");

            log.info("[Cloudinary] ✅ Done: {} in {}ms", originalName, System.currentTimeMillis() - startTime);
            return (String) result.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage(), e);
        }
    }

    // ✅ Pre-read bytes on main thread, then fire both uploads simultaneously
    private String[] uploadBothInParallel(MultipartFile imageFile, MultipartFile pdfFile) {
        try {
            // Validate file sizes upfront — fail fast before wasting time
            validateFile(imageFile, "Image", 10);  // max 10MB
            validateFile(pdfFile,   "PDF",   50);  // max 50MB

            // ✅ Read bytes on main thread — prevents stream contention
            byte[] imageBytes = imageFile.getBytes();
            byte[] pdfBytes   = pdfFile.getBytes();

            String imageName = imageFile.getOriginalFilename();
            String pdfName   = pdfFile.getOriginalFilename();

            log.info("[Upload] Image: {} KB | PDF: {} KB",
                    imageBytes.length / 1024, pdfBytes.length / 1024);

            long start = System.currentTimeMillis();

            // ✅ Fire both uploads simultaneously
            CompletableFuture<String> imgFuture = CompletableFuture.supplyAsync(
                    () -> uploadToCloudinary(imageBytes, imageName, "image"), uploadExecutor);
            CompletableFuture<String> pdfFuture = CompletableFuture.supplyAsync(
                    () -> uploadToCloudinary(pdfBytes,  pdfName,   "raw"),   uploadExecutor);

            // ✅ Wait for both — max 2 minutes
            String imageUrl = imgFuture.get(120, TimeUnit.SECONDS);
            String pdfUrl   = pdfFuture.get(120, TimeUnit.SECONDS);

            log.info("[Upload] ✅ Both done in {}ms", System.currentTimeMillis() - start);
            return new String[]{ imageUrl, pdfUrl };

        } catch (Exception e) {
            throw new RuntimeException("Parallel upload failed: " + e.getMessage(), e);
        }
    }

    // ✅ Validate before uploading — avoids wasting Cloudinary bandwidth
    private void validateFile(MultipartFile file, String label, int maxMB) {
        if (file == null || file.isEmpty())
            throw new RuntimeException(label + " file must not be empty");
        long maxBytes = (long) maxMB * 1024 * 1024;
        if (file.getSize() > maxBytes)
            throw new RuntimeException(label + " exceeds max size of " + maxMB + "MB. Got: "
                    + file.getSize() / (1024 * 1024) + "MB");
    }

    private String extractPublicId(String url) {
        if (url == null || url.isBlank()) return null;
        String[] parts = url.split("/upload/");
        if (parts.length < 2) return null;
        String withoutVersion = parts[1].replaceFirst("^v\\d+/", "");
        int dot = withoutVersion.lastIndexOf('.');
        return dot != -1 ? withoutVersion.substring(0, dot) : withoutVersion;
    }

    private void deleteFromCloudinary(String url, String resourceType) {
        if (url == null || url.isBlank()) return;
        String publicId = extractPublicId(url);
        if (publicId == null) return;
        try {
            cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", resourceType));
        } catch (IOException e) {
            log.warn("[Cloudinary] Could not delete {}: {}", url, e.getMessage());
        }
    }

    // =========================================================================
    // MAPPING
    // =========================================================================

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

    private void applyRequest(Book book, BookRequest req) {
        book.setB_name(req.B_name());
        book.setB_author(req.B_author());
        book.setB_description(req.B_description());
        book.setReleaseDate(req.releaseDate());
        book.setB_Category(req.B_Category());
        book.setB_Language(req.B_Language());
    }

    private BookEvent buildEvent(Book book, String type) {
        return BookEvent.builder()
                .bookId(book.getB_id())
                .bookName(book.getB_name())
                .author(book.getB_author())
                .category(book.getB_Category())
                .language(book.getB_Language())
                .imageUrl(book.getB_imageUrl())
                .pdfUrl(book.getB_pdfUrl())
                .eventType(type)
                .eventTime(LocalDateTime.now())
                .build();
    }

    private void safePublish(BookEvent event) {
        try { bookEventProducer.publish(event); }
        catch (Exception e) {
            log.warn("[Kafka] Publish failed for {} bookId={}: {}",
                    event.getEventType(), event.getBookId(), e.getMessage());
        }
    }

    // =========================================================================
    // UPLOAD
    // =========================================================================

    @Override
    @Transactional
    public BookResponce BookUpload(BookRequest req, MultipartFile imageFile, MultipartFile pdfFile) {
        String[] urls     = uploadBothInParallel(imageFile, pdfFile);
        String   imageUrl = urls[0];
        String   pdfUrl   = urls[1];

        try {
            Book book = Book.builder()
                    .B_name(req.B_name())
                    .B_author(req.B_author())
                    .B_description(req.B_description())
                    .B_imageUrl(imageUrl)
                    .B_pdfUrl(pdfUrl)
                    .releaseDate(req.releaseDate())
                    .B_Category(req.B_Category())
                    .B_Language(req.B_Language())
                    .build();

            Book saved = bookRepo.save(book);
            safePublish(buildEvent(saved, "BOOK_UPLOADED"));
            return mapToResponse(saved);

        } catch (Exception e) {
            CompletableFuture.runAsync(() -> {
                deleteFromCloudinary(imageUrl, "image");
                deleteFromCloudinary(pdfUrl,   "raw");
            }, uploadExecutor);
            throw new RuntimeException("Failed to save book: " + e.getMessage(), e);
        }
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    @Override
    @Transactional
    public BookResponce BookUpdate(Long bookId, BookRequest req,
                                   MultipartFile imageFile, MultipartFile pdfFile) {
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));

        applyRequest(book, req);

        boolean hasNewImage = imageFile != null && !imageFile.isEmpty();
        boolean hasNewPdf   = pdfFile   != null && !pdfFile.isEmpty();

        if (hasNewImage && hasNewPdf) {
            String oldImage = book.getB_imageUrl();
            String oldPdf   = book.getB_pdfUrl();
            String[] urls   = uploadBothInParallel(imageFile, pdfFile);
            book.setB_imageUrl(urls[0]);
            book.setB_pdfUrl(urls[1]);
            CompletableFuture.runAsync(() -> {
                deleteFromCloudinary(oldImage, "image");
                deleteFromCloudinary(oldPdf,   "raw");
            }, uploadExecutor);
        } else {
            if (hasNewImage) {
                try {
                    String old   = book.getB_imageUrl();
                    byte[] bytes = imageFile.getBytes();
                    book.setB_imageUrl(uploadToCloudinary(bytes, imageFile.getOriginalFilename(), "image"));
                    CompletableFuture.runAsync(() -> deleteFromCloudinary(old, "image"), uploadExecutor);
                } catch (IOException e) { throw new RuntimeException("Failed to read image file", e); }
            }
            if (hasNewPdf) {
                try {
                    String old   = book.getB_pdfUrl();
                    byte[] bytes = pdfFile.getBytes();
                    book.setB_pdfUrl(uploadToCloudinary(bytes, pdfFile.getOriginalFilename(), "raw"));
                    CompletableFuture.runAsync(() -> deleteFromCloudinary(old, "raw"), uploadExecutor);
                } catch (IOException e) { throw new RuntimeException("Failed to read PDF file", e); }
            }
        }

        Book updated = bookRepo.save(book);
        safePublish(buildEvent(updated, "BOOK_UPDATED"));
        return mapToResponse(updated);
    }

    // =========================================================================
    // DELETE
    // =========================================================================

    @Override
    @Transactional
    public BookResponce BookDelete(Long bookId) {
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));

        BookResponce response = mapToResponse(book);
        BookEvent    event    = buildEvent(book, "BOOK_DELETED");

        bookRepo.deleteById(bookId);
        safePublish(event);

        // ✅ Cloudinary delete is async — response returns instantly
        CompletableFuture.runAsync(() -> {
            deleteFromCloudinary(book.getB_imageUrl(), "image");
            deleteFromCloudinary(book.getB_pdfUrl(),   "raw");
        }, uploadExecutor);

        return response;
    }

    // =========================================================================
    // QUERIES
    // =========================================================================

    @Override
    public List<BookResponce> findAll() {
        return bookRepo.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookResponce> searchBooks(String B_name, String B_author,
                                          Date releaseDate, String B_Category,
                                          String B_Language) {
        return bookRepo.searchBooks(
                (B_name     != null && !B_name.isBlank())     ? B_name     : null,
                (B_author   != null && !B_author.isBlank())   ? B_author   : null,
                releaseDate,
                (B_Category != null && !B_Category.isBlank()) ? B_Category : null
        ).stream().map(this::mapToResponse).collect(Collectors.toList());
    }
}