package com.example.orders.notification.kafka;

import com.example.orders.events.InventoryReserved;
import com.example.orders.notification.api.NotificationEvent;
import com.example.orders.notification.redis.RedisNotificationFanout;

import java.time.Instant;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code inventory.reserved} — drives Stock list refresh on the UI.
 * Lab 5 — map to NotificationEvent and publish to Redis fan-out.
 */
@Component
public class InventoryReservedListener {

    private final RedisNotificationFanout fanout;

    public InventoryReservedListener(RedisNotificationFanout fanout) {
        this.fanout = fanout;
    }

    @KafkaListener(topics = KafkaTopics.INVENTORY_RESERVED, groupId = "notification-service")
    public void onInventoryReserved(InventoryReserved event) {
        NotificationEvent notificationEvent = new NotificationEvent(
                event.orderId(),
                NotificationEvent.TYPE_INVENTORY_RESERVED,
                "Inventory reservation " + (event.success() ? "OK" : "KO"),
                event.success(),
                event.reservedAt() != null ? event.reservedAt() : Instant.now());
        fanout.publish(notificationEvent);
    }
}
