package com.Mail.MailSevice.service;

import com.Mail.MailSevice.dto.MailRequestDto;
import com.Mail.MailSevice.dto.MailResponseDto;
import com.Mail.MailSevice.exception.MailSendException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public MailResponseDto sendWelcomeMail(MailRequestDto request) {
        try {
            String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                  <div style="background:#4a90e2;color:white;padding:20px;text-align:center;border-radius:6px 6px 0 0;">
                    <h2>Welcome to E-Library!</h2>
                  </div>
                  <div style="padding:30px;background:white;">
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Your account has been created successfully. Start exploring thousands of books!</p>
                    <a href="#" style="background:#4a90e2;color:white;padding:12px 24px;border-radius:5px;text-decoration:none;">Browse Books</a>
                  </div>
                </div>
                """.formatted(request.name());

            sendHtmlMail(request.to(), "Welcome to E-Library!", html);
            log.info("Welcome mail sent to: {}", request.to());
            return MailResponseDto.ok();
        } catch (Exception e) {
            log.error("Failed to send welcome mail: {}", e.getMessage());
            throw new MailSendException("Failed to send welcome mail");
        }
    }

    @Override
    public MailResponseDto sendSubscriptionMail(MailRequestDto request) {
        try {
            String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                  <div style="background:#27ae60;color:white;padding:20px;text-align:center;border-radius:6px 6px 0 0;">
                    <h2>Subscription Confirmed!</h2>
                  </div>
                  <div style="padding:30px;background:white;">
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Your subscription has been successfully activated.</p>
                    <div style="background:#e8f5e9;border:1px solid #27ae60;border-radius:6px;padding:15px;">
                      <p>%s</p>
                    </div>
                    <p>You now have full access to our premium library. Enjoy reading!</p>
                  </div>
                </div>
                """.formatted(request.name(), request.body());

            sendHtmlMail(request.to(), "Subscription Confirmed - E-Library", html);
            log.info("Subscription mail sent to: {}", request.to());
            return MailResponseDto.ok();
        } catch (Exception e) {
            log.error("Failed to send subscription mail: {}", e.getMessage());
            throw new MailSendException("Failed to send subscription mail");
        }
    }

    @Override
    public MailResponseDto sendBookUploadNotification(MailRequestDto request) {
        try {
            String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                  <div style="background:#8e44ad;color:white;padding:20px;text-align:center;border-radius:6px 6px 0 0;">
                    <h2>New Book Available!</h2>
                  </div>
                  <div style="padding:30px;background:white;">
                    <p>Hi <strong>%s</strong>,</p>
                    <p>A new book has been added to our collection!</p>
                    <div style="background:#f3e5f5;border-radius:6px;padding:15px;">
                      <p>%s</p>
                    </div>
                    <a href="#" style="background:#8e44ad;color:white;padding:12px 24px;border-radius:5px;text-decoration:none;display:inline-block;margin-top:15px;">Read Now</a>
                  </div>
                </div>
                """.formatted(request.name(), request.body());

            sendHtmlMail(request.to(), "New Book Available - E-Library", html);
            log.info("Book notification sent to: {}", request.to());
            return MailResponseDto.ok();
        } catch (Exception e) {
            log.error("Failed to send book notification: {}", e.getMessage());
            throw new MailSendException("Failed to send book upload notification");
        }
    }

    @Override
    public MailResponseDto sendPasswordResetMail(MailRequestDto request) {
        try {
            String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                  <div style="background:#e74c3c;color:white;padding:20px;text-align:center;border-radius:6px 6px 0 0;">
                    <h2>Password Reset Request</h2>
                  </div>
                  <div style="padding:30px;background:white;">
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Use the OTP below to reset your password:</p>
                    <div style="background:#fdecea;border:2px dashed #e74c3c;border-radius:8px;padding:20px;text-align:center;">
                      <h1 style="color:#e74c3c;letter-spacing:8px;">%s</h1>
                      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                    </div>
                    <p style="color:#999;font-size:12px;margin-top:20px;">If you did not request this, please ignore this email.</p>
                  </div>
                </div>
                """.formatted(request.name(), request.body());

            sendHtmlMail(request.to(), "Password Reset OTP - E-Library", html);
            log.info("Password reset mail sent to: {}", request.to());
            return MailResponseDto.ok();
        } catch (Exception e) {
            log.error("Failed to send password reset mail: {}", e.getMessage());
            throw new MailSendException("Failed to send password reset mail");
        }
    }

    private void sendHtmlMail(String to, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }
}
