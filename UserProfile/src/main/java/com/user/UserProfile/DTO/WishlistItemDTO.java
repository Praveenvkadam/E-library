package com.user.UserProfile.DTO;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WishlistItemDTO {

    private String id;

    // ── enriched from BookResponce ────────────────────────
    private Long bookId;
    private String title;
    private String author;
    private String description;
    private String coverUrl;
    private String pdfUrl;
    private String category;
    private String language;
    private Date releaseDate;

    // ── Wishlist-specific ─────────────────────────────────
    private LocalDateTime addedAt;
}