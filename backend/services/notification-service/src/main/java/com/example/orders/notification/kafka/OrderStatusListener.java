package com.example.orders.notification.kafka;

import com.example.orders.events.OrderStatusChanged;
import com.example.orders.notification.api.NotificationEvent;
import com.example.orders.notification.sse.SseHub;

import java.time.Instant;

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
        Boolean success = switch (event.status() == null ? "" : event.status()) {
            case "CONFIRMED" -> Boolean.TRUE;
            case "CANCELLED" -> Boolean.FALSE;
            default -> null;
        };
        NotificationEvent notificationEvent = new NotificationEvent(
                event.orderId(),
                NotificationEvent.TYPE_ORDER_STATUS,
                "Order status: " + event.status(),
                success,
                event.changedAt() != null ? event.changedAt() : Instant.now());
        sseHub.broadcast(notificationEvent);
    }
}
