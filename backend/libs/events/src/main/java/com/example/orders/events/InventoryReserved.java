package com.example.orders.events;

import java.time.Instant;
import java.util.UUID;

/** Contract published to topic {@code inventory.reserved}. */
public record InventoryReserved(
        UUID orderId,
        boolean success,
        Instant reservedAt,
        String failureReason
) {
}
