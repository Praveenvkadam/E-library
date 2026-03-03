package com.Mail.MailSevice.controller;
import com.Mail.MailSevice.dto.MailRequestDto;
import com.Mail.MailSevice.dto.MailResponseDto;
import com.Mail.MailSevice.service.MailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    @PostMapping("/welcome")
    public ResponseEntity<MailResponseDto> sendWelcome(@Valid @RequestBody MailRequestDto request) {
        return ResponseEntity.ok(mailService.sendWelcomeMail(request));
    }

    @PostMapping("/subscription")
    public ResponseEntity<MailResponseDto> sendSubscription(@Valid @RequestBody MailRequestDto request) {
        return ResponseEntity.ok(mailService.sendSubscriptionMail(request));
    }

    @PostMapping("/book-notification")
    public ResponseEntity<MailResponseDto> sendBookNotification(@Valid @RequestBody MailRequestDto request) {
        return ResponseEntity.ok(mailService.sendBookUploadNotification(request));
    }

    @PostMapping("/password-reset")
    public ResponseEntity<MailResponseDto> sendPasswordReset(@Valid @RequestBody MailRequestDto request) {
        return ResponseEntity.ok(mailService.sendPasswordResetMail(request));
    }
}
