package com.user.UserProfile.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookmarkResponseDTO {

    private String id;

    // ── enriched from BookResponce ────────────────────────
    private Long bookId;
    private String title;
    private String author;
    private String coverUrl;
    private String category;
    private String language;

    // ── Bookmark-specific ─────────────────────────────────
    private Integer pageNumber;
    private String note;
    private LocalDateTime createdAt;
}