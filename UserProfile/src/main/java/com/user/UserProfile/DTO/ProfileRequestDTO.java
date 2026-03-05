package com.user.UserProfile.DTO;

import lombok.Data;

@Data
public class ProfileRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private int bookMarked;
    private String readHistory;
}