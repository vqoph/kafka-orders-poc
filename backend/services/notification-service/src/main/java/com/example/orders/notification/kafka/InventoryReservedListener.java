package com.example.orders.notification.kafka;

import com.example.orders.events.InventoryReserved;
import com.example.orders.notification.sse.SseHub;
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
        /*
         * ## Lab 5 — map + broadcast (à coder)
         *
         * type = NotificationEvent.TYPE_INVENTORY_RESERVED
         * message e.g. "Inventory reservation " + (event.success() ? "OK" : "KO")
         * then sseHub.broadcast(...).
         */
        if (sseHub == null || event == null) {
            return;
        }
        // TODO Lab 5
    }
}
