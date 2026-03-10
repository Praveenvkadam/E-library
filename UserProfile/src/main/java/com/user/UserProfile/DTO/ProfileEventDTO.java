package com.user.UserProfile.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileEventDTO {
    private String userId;
    private String eventType;   // PROFILE_CREATED | PROFILE_UPDATED | PROFILE_DELETED
    private String email;
    private String firstName;
    private String lastName;
    private LocalDateTime eventTime;
}