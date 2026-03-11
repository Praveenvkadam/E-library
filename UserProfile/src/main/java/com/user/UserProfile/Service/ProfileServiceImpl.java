package com.user.UserProfile.Service;

import com.user.UserProfile.DTO.*;
import com.user.UserProfile.Entity.*;
import com.user.UserProfile.Entity.ReadingHistory.ReadStatus;
import com.user.UserProfile.Exception.*;
import com.user.UserProfile.Feign.dto.BookResponce;
import com.user.UserProfile.Kafka.KafkaEventDispatcher;
import com.user.UserProfile.Kafka.ProfileEventProducer;
import com.user.UserProfile.Repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository        profileRepository;
    private final ReadingHistoryRepository readingHistoryRepository;
    private final BookmarkRepository       bookmarkRepository;
    private final WishlistRepository       wishlistRepository;
    private final KafkaEventDispatcher     kafkaDispatcher;
    private final BookCacheService         bookCacheService;
    private final ProfileEventProducer eventProducer;

    // ── Create (from Kafka — Authentication service) ──────────────
    @Override
    @Transactional
    public ProfileResponseDTO createProfile(ProfileEventDTO event) {
        if (profileRepository.existsById(event.getUserId())) {
            log.warn("⚠️ Profile already exists → userId: [{}] skipping", event.getUserId());
            return mapToResponse(event.getUserId());
        }

        Profile profile = Profile.builder()
                .userId(event.getUserId())
                .firstName(event.getFirstName())
                .lastName(event.getLastName())
                .email(event.getEmail())
                .build();

        profileRepository.save(profile);
        log.info("✅ Profile created from Kafka → userId: [{}]", profile.getUserId());

        // ✅ Fix #1: now truly async — doesn't block HTTP response
        kafkaDispatcher.dispatch(
                () -> eventProducer.sendProfileCreated(buildEvent(profile, "PROFILE_CREATED")),
                "PROFILE_CREATED", profile.getUserId()
        );
        return mapToResponse(profile.getUserId());
    }

    // ── Create (from REST) ────────────────────────────────────────
    @Override
    @Transactional
    public ProfileResponseDTO createProfile(String userId, ProfileRequestDTO dto) {
        if (profileRepository.existsById(userId)) {
            throw new ProfileAlreadyExistsException(
                    "Profile already exists for userId: " + userId);
        }

        Profile profile = Profile.builder()
                .userId(userId)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .build();

        profileRepository.save(profile);
        log.info(" Profile created via REST → userId: [{}]", userId);

        kafkaDispatcher.dispatch(
                () -> eventProducer.sendProfileCreated(buildEvent(profile, "PROFILE_CREATED")),
                "PROFILE_CREATED", userId
        );
        return mapToResponse(userId);
    }

    // ── Read ──────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public ProfileResponseDTO getProfileByUserId(String userId) {
        return mapToResponse(userId);
    }

    // ── Update ────────────────────────────────────────────────────
    @Override
    @Transactional
    public ProfileResponseDTO updateProfile(String userId, ProfileRequestDTO dto) {
        Profile profile = findOrThrow(userId);

        profile.setFirstName(dto.getFirstName());
        profile.setLastName(dto.getLastName());
        profile.setPhone(dto.getPhone());

        profileRepository.save(profile);
        log.info("✅ Profile updated → userId: [{}]", userId);

        kafkaDispatcher.dispatch(
                () -> eventProducer.sendProfileUpdated(buildEvent(profile, "PROFILE_UPDATED")),
                "PROFILE_UPDATED", userId
        );
        return mapToResponse(userId);
    }

    // ── Delete ────────────────────────────────────────────────────
    @Override
    @Transactional
    public void deleteProfile(String userId) {
        Profile profile = findOrThrow(userId);

        readingHistoryRepository.deleteAllByProfile(profile);
        bookmarkRepository.deleteAllByProfile(profile);
        wishlistRepository.deleteAllByProfile(profile);
        profileRepository.delete(profile);

        log.info("✅ Profile and all related data deleted → userId: [{}]", userId);

        kafkaDispatcher.dispatch(
                () -> eventProducer.sendProfileDeleted(buildEvent(profile, "PROFILE_DELETED")),
                "PROFILE_DELETED", userId
        );
    }

    // ── Reading Progress ──────────────────────────────────────────
    @Override
    @Transactional
    public void updateReadingProgress(String userId, ReadingProgressUpdateDTO dto) {
        Profile profile = findOrThrow(userId);

        ReadingHistory entry = readingHistoryRepository
                .findByProfileAndBookId(profile, dto.getBookId())
                .orElse(ReadingHistory.builder()
                        .profile(profile)
                        .bookId(dto.getBookId())
                        .status(ReadStatus.READING)
                        .build());

        if (dto.getProgressPercent() != null) entry.setProgressPercent(dto.getProgressPercent());
        if (dto.getCurrentPage()     != null) entry.setCurrentPage(dto.getCurrentPage());
        if (dto.getTotalPages()      != null) entry.setTotalPages(dto.getTotalPages());

        if (dto.getStatus() != null) {
            entry.setStatus(dto.getStatus());
        } else if (dto.getProgressPercent() != null && dto.getProgressPercent() >= 100.0) {
            entry.setStatus(ReadStatus.COMPLETED);
        }

        readingHistoryRepository.save(entry);
        log.info("✅ Progress updated → userId: [{}] bookId: [{}] {}% status: [{}]",
                userId, dto.getBookId(), dto.getProgressPercent(), entry.getStatus());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfileResponseDTO.ReadingHistoryDTO> getReadingHistory(String userId) {
        Profile profile = profileRepository.findWithReadingHistoryByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profile not found for userId: " + userId));

        List<Long> ids = profile.getReadingHistory().stream()
                .map(rh -> Long.parseLong(rh.getBookId())).toList();

        Map<Long, BookResponce> bookMap = bookCacheService.fetchBookMap(ids);
        return profile.getReadingHistory().stream()
                .map(rh -> toReadingHistoryDTOFromMap(rh, bookMap))
                .collect(Collectors.toList());
    }

    // ── Bookmarks ─────────────────────────────────────────────────
    @Override
    @Transactional
    public BookmarkResponseDTO addBookmark(String userId, String bookId,
                                           Integer page, String note) {
        Profile profile = findOrThrow(userId);

        if (bookmarkRepository.existsByProfileAndBookIdAndPageNumber(profile, bookId, page)) {
            throw new ProfileAlreadyExistsException(
                    "Bookmark already exists for bookId: " + bookId + " page: " + page);
        }

        Bookmark bookmark = Bookmark.builder()
                .profile(profile)
                .bookId(bookId)
                .pageNumber(page)
                .note(note)
                .build();

        Bookmark saved = bookmarkRepository.save(bookmark);
        log.info("✅ Bookmark added → userId: [{}] bookId: [{}] page: [{}]",
                userId, bookId, page);

        Map<Long, BookResponce> bookMap = bookCacheService
                .fetchBookMap(List.of(Long.parseLong(bookId)));
        return toBookmarkDTOFromMap(saved, bookMap);
    }

    @Override
    @Transactional
    public void removeBookmark(String userId, String bookmarkId) {
        Bookmark bookmark = bookmarkRepository.findById(bookmarkId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Bookmark not found: " + bookmarkId));
        bookmarkRepository.delete(bookmark);
        log.info("✅ Bookmark removed → userId: [{}] bookmarkId: [{}]", userId, bookmarkId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookmarkResponseDTO> getBookmarks(String userId) {
        Profile profile = profileRepository.findWithBookmarksByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profile not found for userId: " + userId));

        List<Long> ids = profile.getBookmarks().stream()
                .map(b -> Long.parseLong(b.getBookId())).toList();

        Map<Long, BookResponce> bookMap = bookCacheService.fetchBookMap(ids);
        return profile.getBookmarks().stream()
                .map(b -> toBookmarkDTOFromMap(b, bookMap))
                .collect(Collectors.toList());
    }

    // ── Wishlist ──────────────────────────────────────────────────
    @Override
    @Transactional
    public WishlistItemDTO addToWishlist(String userId, String bookId) {
        Profile profile = findOrThrow(userId);

        if (wishlistRepository.existsByProfileAndBookId(profile, bookId)) {
            throw new ProfileAlreadyExistsException(
                    "Book already in wishlist → bookId: " + bookId);
        }

        WishlistItem item = WishlistItem.builder()
                .profile(profile)
                .bookId(bookId)
                .build();

        WishlistItem saved = wishlistRepository.save(item);
        log.info("✅ Wishlist item added → userId: [{}] bookId: [{}]", userId, bookId);

        Map<Long, BookResponce> bookMap = bookCacheService
                .fetchBookMap(List.of(Long.parseLong(bookId)));
        return toWishlistDTOFromMap(saved, bookMap);
    }

    @Override
    @Transactional
    public void removeFromWishlist(String userId, String wishlistItemId) {
        WishlistItem item = wishlistRepository.findById(wishlistItemId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Wishlist item not found: " + wishlistItemId));
        wishlistRepository.delete(item);
        log.info("✅ Wishlist item removed → userId: [{}] itemId: [{}]",
                userId, wishlistItemId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDTO> getWishlist(String userId) {
        Profile profile = profileRepository.findWithWishlistByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profile not found for userId: " + userId));

        List<Long> ids = profile.getWishlist().stream()
                .map(w -> Long.parseLong(w.getBookId())).toList();

        Map<Long, BookResponce> bookMap = bookCacheService.fetchBookMap(ids);
        return profile.getWishlist().stream()
                .map(w -> toWishlistDTOFromMap(w, bookMap))
                .collect(Collectors.toList());
    }

    // ── Private Helpers ───────────────────────────────────────────

    private Profile findOrThrow(String userId) {
        return profileRepository.findByIdOnly(userId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profile not found for userId: " + userId));
    }

    private ProfileEventDTO buildEvent(Profile profile, String eventType) {
        return ProfileEventDTO.builder()
                .userId(profile.getUserId())
                .email(profile.getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .eventType(eventType)
                .eventTime(LocalDateTime.now())
                .build();
    }

    // ── ✅ Fix #2: single JOIN FETCH query replaces 4 separate DB round-trips ──
    private ProfileResponseDTO mapToResponse(String userId) {
        // ONE query fetches profile + all 3 collections via LEFT JOIN FETCH
        // Add this to ProfileRepository:
        //
        //   @Query("""
        //       SELECT p FROM Profile p
        //       LEFT JOIN FETCH p.readingHistory
        //       LEFT JOIN FETCH p.bookmarks
        //       LEFT JOIN FETCH p.wishlist
        //       WHERE p.userId = :userId
        //   """)
        //   Optional<Profile> findFullProfileByUserId(@Param("userId") String userId);
        //
        Profile p = profileRepository.findFullProfileByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException(
                        "Profile not found for userId: " + userId));

        // Collect all unique book IDs in one pass
        Set<Long> allIds = new HashSet<>();
        p.getReadingHistory().forEach(rh -> allIds.add(Long.parseLong(rh.getBookId())));
        p.getBookmarks()     .forEach(b  -> allIds.add(Long.parseLong(b.getBookId())));
        p.getWishlist()      .forEach(w  -> allIds.add(Long.parseLong(w.getBookId())));

        // ONE cached batch call to book service
        Map<Long, BookResponce> bookMap = bookCacheService
                .fetchBookMap(new ArrayList<>(allIds));

        return ProfileResponseDTO.builder()
                .userId(p.getUserId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .bookmarkCount(p.getBookmarks().size())
                .wishlistCount(p.getWishlist().size())
                .readingHistory(p.getReadingHistory().stream()
                        .map(rh -> toReadingHistoryDTOFromMap(rh, bookMap))
                        .collect(Collectors.toList()))
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    // ── Mappers ───────────────────────────────────────────────────
    private ProfileResponseDTO.ReadingHistoryDTO toReadingHistoryDTOFromMap(
            ReadingHistory rh, Map<Long, BookResponce> bookMap) {

        BookResponce book = bookMap.get(Long.parseLong(rh.getBookId()));
        var builder = ProfileResponseDTO.ReadingHistoryDTO.builder()
                .status(rh.getStatus().name())
                .progressPercent(rh.getProgressPercent())
                .currentPage(rh.getCurrentPage())
                .totalPages(rh.getTotalPages())
                .startedAt(rh.getStartedAt())
                .lastReadAt(rh.getLastReadAt())
                .completedAt(rh.getCompletedAt());

        if (book != null) {
            builder.bookId(book.B_id())
                    .name(book.nameOrDefault())
                    .author(book.authorOrDefault())
                    .description(book.descriptionOrDefault())
                    .imageUrl(book.imageUrlOrDefault())
                    .pdfUrl(book.B_pdfUrl())
                    .releaseDate(book.releaseDate())
                    .category(book.categoryOrDefault())
                    .language(book.languageOrDefault());
        } else {
            builder.bookId(Long.parseLong(rh.getBookId())).name("Unavailable");
        }
        return builder.build();
    }

    private BookmarkResponseDTO toBookmarkDTOFromMap(
            Bookmark b, Map<Long, BookResponce> bookMap) {

        BookResponce book = bookMap.get(Long.parseLong(b.getBookId()));
        var builder = BookmarkResponseDTO.builder()
                .id(b.getId())
                .bookId(Long.parseLong(b.getBookId()))
                .pageNumber(b.getPageNumber())
                .note(b.getNote())
                .createdAt(b.getCreatedAt());

        if (book != null) {
            builder.title(book.nameOrDefault())
                    .author(book.authorOrDefault())
                    .coverUrl(book.imageUrlOrDefault())
                    .category(book.categoryOrDefault())
                    .language(book.languageOrDefault());
        } else {
            builder.title("Unavailable");
        }
        return builder.build();
    }

    private WishlistItemDTO toWishlistDTOFromMap(
            WishlistItem w, Map<Long, BookResponce> bookMap) {

        BookResponce book = bookMap.get(Long.parseLong(w.getBookId()));
        var builder = WishlistItemDTO.builder()
                .id(w.getId())
                .bookId(Long.parseLong(w.getBookId()))
                .addedAt(w.getAddedAt());

        if (book != null) {
            builder.title(book.nameOrDefault())
                    .author(book.authorOrDefault())
                    .description(book.descriptionOrDefault())
                    .coverUrl(book.imageUrlOrDefault())
                    .pdfUrl(book.B_pdfUrl())
                    .category(book.categoryOrDefault())
                    .language(book.languageOrDefault())
                    .releaseDate(book.releaseDate());
        } else {
            builder.title("Unavailable");
        }
        return builder.build();
    }
}