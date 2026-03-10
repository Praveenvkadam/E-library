package com.user.UserProfile.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "wishlist_items",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_wishlist_user_book",
                columnNames = {"user_id", "book_id"}
        )
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private Profile profile;

    @Column(name = "book_id", nullable = false)
    private String bookId;

    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }
}