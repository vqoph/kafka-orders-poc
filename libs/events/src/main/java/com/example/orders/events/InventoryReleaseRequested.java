package com.example.orders.events;

import java.time.Instant;
import java.util.UUID;

/** Compensation: ask inventory-service to release a prior reservation. */
public record InventoryReleaseRequested(
        UUID orderId,
        Instant requestedAt
) {
}
