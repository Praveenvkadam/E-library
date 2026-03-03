package com.Mail.MailSevice.dto;

import java.time.LocalDateTime;

public record MailResponseDto(
        boolean success,
        String message,
        LocalDateTime sentAt
) {

    public static MailResponseDto ok() {
        return new MailResponseDto(true, "Mail sent successfully", LocalDateTime.now());
    }

    public static MailResponseDto failure(String reason) {
        return new MailResponseDto(false, reason, LocalDateTime.now());
    }
}
