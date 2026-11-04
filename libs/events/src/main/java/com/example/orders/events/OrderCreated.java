package com.example.orders.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Contract published to topic {@code orders.created}.
 * Shared by all services (like a type in ts-shared).
 */
public record OrderCreated(
        UUID orderId,
        String customerId,
        BigDecimal amount,
        List<OrderItemData> items,
        Instant createdAt
) {
}
