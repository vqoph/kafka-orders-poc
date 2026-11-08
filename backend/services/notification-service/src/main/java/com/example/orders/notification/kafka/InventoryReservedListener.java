package com.example.orders.notification.kafka;

import com.example.orders.events.InventoryReserved;
import com.example.orders.notification.api.NotificationEvent;
import com.example.orders.notification.sse.SseHub;

import java.time.Instant;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code inventory.reserved} — drives Stock list refresh on the UI.
 * Lab 5 — map to NotificationEvent and broadcast.
 */
@Component
public class InventoryReservedListener {

    private final SseHub sseHub;

    public InventoryReservedListener(SseHub sseHub) {
        this.sseHub = sseHub;
    }

    @KafkaListener(topics = KafkaTopics.INVENTORY_RESERVED, groupId = "notification-service")
    public void onInventoryReserved(InventoryReserved event) {
        NotificationEvent notificationEvent = new NotificationEvent(
                event.orderId(),
                NotificationEvent.TYPE_INVENTORY_RESERVED,
                "Inventory reservation " + (event.success() ? "OK" : "KO"),
                event.success(),
                event.reservedAt() != null ? event.reservedAt() : Instant.now());
        sseHub.broadcast(notificationEvent);
    }
}
