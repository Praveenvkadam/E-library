package com.Mail.MailSevice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MailRequestDto(

        @NotBlank(message = "Recipient email is required")
        @Email(message = "Invalid email format")
        String to,

        @NotBlank(message = "Subject is required")
        String subject,

        @NotBlank(message = "Name is required")
        String name,

        String body,

        @NotNull(message = "Mail type is required")
        MailType type

) {}
