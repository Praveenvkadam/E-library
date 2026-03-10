package com.user.UserProfile.DTO;

import com.user.UserProfile.Entity.ReadingHistory.ReadStatus;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReadingProgressUpdateDTO {

    @NotBlank(message = "Book ID is required")
    private String bookId;

    @NotNull(message = "Progress percent is required")
    @DecimalMin(value = "0.0", message = "Progress cannot be negative")
    @DecimalMax(value = "100.0", message = "Progress cannot exceed 100")
    private Double progressPercent;

    @Min(value = 0, message = "Current page cannot be negative")
    private Integer currentPage;

    @Min(value = 1, message = "Total pages must be at least 1")
    private Integer totalPages;

    // Manual override — e.g. PAUSED, DROPPED
    private ReadStatus status;
}