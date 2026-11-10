package com.example.orders.payment.api;

import com.example.orders.payment.domain.Payment;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * HTTP DTO for a payment row. Keep separate from the JPA {@link Payment} entity.
 * See doc/fr/appendices/exercises/lab-04-stock-payment-rest.md
 */
@Schema(requiredProperties = { "id", "orderId", "amount", "success", "processedAt" })
public record PaymentResponse(
        UUID id,
        UUID orderId,
        BigDecimal amount,
        boolean success,
        Instant processedAt,
        @Schema(nullable = true) Instant refundedAt) {

    /**
     * Map entity → response.
     */
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getAmount(),
                payment.isSuccess(),
                payment.getProcessedAt(),
                payment.getRefundedAt());
    }
}
