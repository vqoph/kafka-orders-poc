package com.example.orders.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentProcessed(
        UUID orderId,
        BigDecimal amount,
        boolean success,
        Instant processedAt,
        String failureReason) {

}
