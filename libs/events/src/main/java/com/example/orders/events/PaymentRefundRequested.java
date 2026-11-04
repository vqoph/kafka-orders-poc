package com.example.orders.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Compensation: ask payment-service to mark a successful payment as refunded. */
public record PaymentRefundRequested(
        UUID orderId,
        BigDecimal amount,
        Instant requestedAt
) {
}
