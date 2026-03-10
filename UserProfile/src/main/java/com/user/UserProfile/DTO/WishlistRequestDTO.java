package com.user.UserProfile.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WishlistRequestDTO {

    @NotBlank(message = "Book ID is required")
    private String bookId;
}