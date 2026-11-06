package com.example.orders.notification.kafka;

import com.example.orders.events.OrderStatusChanged;
import com.example.orders.notification.sse.SseHub;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code orders.status} in group {@code notification-service}
 * (separate from {@code order-service} — each group sees the full stream).
 * Lab 5 — map to NotificationEvent and broadcast.
 */
@Component
public class OrderStatusListener {

    private final SseHub sseHub;

    public OrderStatusListener(SseHub sseHub) {
        this.sseHub = sseHub;
    }

    @KafkaListener(topics = KafkaTopics.ORDERS_STATUS, groupId = "notification-service")
    public void onOrderStatusChanged(OrderStatusChanged event) {
        /*
         * ## Lab 5 — map + broadcast (à coder)
         *
         * Build NotificationEvent(
         *   orderId = event.orderId(),
         *   type = NotificationEvent.TYPE_ORDER_STATUS,
         *   message = "Order status: " + event.status(),
         *   at = event.changedAt() or Instant.now()
         * ) then sseHub.broadcast(...).
         */
        // Keep injection wired until Lab 5 is implemented.
        if (sseHub == null || event == null) {
            return;
        }
        // TODO Lab 5
    }
}
