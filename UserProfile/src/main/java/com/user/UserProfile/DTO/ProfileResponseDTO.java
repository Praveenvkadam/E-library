package com.user.UserProfile.DTO;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponseDTO {

    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private int bookmarkCount;
    private int wishlistCount;
    private List<ReadingHistoryDTO> readingHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReadingHistoryDTO {

        // ── from ReadingHistory entity ────────────────────
        private String status;
        private Double progressPercent;
        private Integer currentPage;
        private Integer totalPages;
        private LocalDateTime startedAt;
        private LocalDateTime lastReadAt;
        private LocalDateTime completedAt;

        // ── enriched from BookResponce ────────────────────
        private Long bookId;
        private String name;
        private String author;
        private String description;
        private String imageUrl;
        private String pdfUrl;
        private Date releaseDate;
        private String category;
        private String language;
    }
}