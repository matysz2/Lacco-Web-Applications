package com.example.Lacco.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service for sending emails
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@lacco.pl");
            message.setTo(to);
            message.setSubject("Resetowanie hasła - Lacco");
            message.setText(buildResetEmailBody(resetLink));

            mailSender.send(message);
            log.info("Password reset email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send reset email", e);
        }
    }

    /**
     * Builds the reset email body
     */
    private String buildResetEmailBody(String resetLink) {
        return """
            Drogi Użytkowniku,

            Otrzymaliśmy żądanie resetowania hasła do Twojego konta w systemie Lacco.

            Aby ustawić nowe hasło, kliknij na poniższy link:
            %s

            Link będzie ważny przez 24 godziny.

            Jeśli nie żądałeś resetowania hasła, zignoruj tę wiadomość.

            Pozdrawiamy,
            Zespół Lacco
            """.formatted(resetLink);
    }
}