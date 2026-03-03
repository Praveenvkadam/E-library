package com.Mail.MailSevice.service;


import com.Mail.MailSevice.dto.MailRequestDto;
import com.Mail.MailSevice.dto.MailResponseDto;

public interface MailService {
    MailResponseDto sendWelcomeMail(MailRequestDto request);
    MailResponseDto sendSubscriptionMail(MailRequestDto request);
    MailResponseDto sendBookUploadNotification(MailRequestDto request);
    MailResponseDto sendPasswordResetMail(MailRequestDto request);
}

