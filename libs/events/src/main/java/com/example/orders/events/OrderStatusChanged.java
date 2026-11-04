package com.example.orders.events;

import java.time.Instant;
import java.util.UUID;

/**
 * Contract published to topic {@code orders.status}.
 * {@code status} is the enum name ({@code CONFIRMED}, {@code CANCELLED}, …).
 */
public record OrderStatusChanged(
        UUID orderId,
        String status,
        Instant changedAt
) {
}
