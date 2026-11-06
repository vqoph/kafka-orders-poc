package com.example.orders.payment.api;

import com.example.orders.payment.domain.Payment;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * HTTP DTO for a payment row (Lab 4). Keep separate from the JPA {@link Payment} entity.
 */
@Schema(requiredProperties = {"id", "orderId", "amount", "success", "processedAt"})
public record PaymentResponse(
        UUID id,
        UUID orderId,
        BigDecimal amount,
        boolean success,
        Instant processedAt,
        @Schema(nullable = true) Instant refundedAt) {

    /**
     * Map entity → response.
     * TODO Lab 4: return {@code new PaymentResponse(...)} using getters on {@code payment}.
     */
    public static PaymentResponse from(Payment payment) {
        // TODO Lab 4: map Payment → PaymentResponse (id, orderId, amount, success, processedAt, refundedAt)
        throw new UnsupportedOperationException("TODO Lab 4");
    }
}
