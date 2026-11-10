package com.example.orders.notification.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

/**
 * Payload pushed on the SSE stream.
 * {@code type} is the discriminant used by the front (RTK tag invalidation).
 */
@Schema(requiredProperties = {"type", "message", "at"})
public record NotificationEvent(
        @Schema(nullable = true) UUID orderId,
        String type,
        String message,
        @Schema(nullable = true, description = "Outcome when applicable (null for CONNECTED / unknown)")
        Boolean success,
        Instant at) {

    public static final String TYPE_CONNECTED = "CONNECTED";
    public static final String TYPE_ORDER_STATUS = "ORDER_STATUS";
    public static final String TYPE_PAYMENT_PROCESSED = "PAYMENT_PROCESSED";
    public static final String TYPE_INVENTORY_RESERVED = "INVENTORY_RESERVED";
}
