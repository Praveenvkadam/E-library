package com.Mail.MailSevice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class MailSendException extends RuntimeException {
    public MailSendException(String message) {
        super(message);
    }
}
