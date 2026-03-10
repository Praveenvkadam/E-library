package com.user.UserProfile.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "bookmarks",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_bookmark_user_book_page",
                columnNames = {"user_id", "book_id", "page_number"}
        )
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Bookmark {

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

    @Column(name = "page_number")
    private Integer pageNumber;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}