package com.user.UserProfile.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "reading_history",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_reading_user_book",
                columnNames = {"user_id", "book_id"}
        )
)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReadingHistory {

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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ReadStatus status = ReadStatus.READING;

    @Builder.Default
    @Column(name = "progress_percent")
    private Double progressPercent = 0.0;

    @Column(name = "current_page")
    private Integer currentPage;

    @Column(name = "total_pages")
    private Integer totalPages;

    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum ReadStatus {
        READING, COMPLETED, PAUSED, DROPPED
    }

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        lastReadAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastReadAt = LocalDateTime.now();
        if (status == ReadStatus.COMPLETED && completedAt == null) {
            completedAt = LocalDateTime.now();
            progressPercent = 100.0;
        }
    }
}