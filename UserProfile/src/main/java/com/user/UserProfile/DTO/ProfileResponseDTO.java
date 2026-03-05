package com.user.UserProfile.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

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
    private int bookMarked;
    private String readHistory;
    private Date updatedDate;
}