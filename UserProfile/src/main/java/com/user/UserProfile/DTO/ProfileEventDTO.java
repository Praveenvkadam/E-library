package com.user.UserProfile.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileEventDTO {
    private String userId;
    private String eventType;       // CREATED / UPDATED / DELETED
    private String email;
    private String firstName;
    private String lastName;
    private LocalDateTime eventTime;
}