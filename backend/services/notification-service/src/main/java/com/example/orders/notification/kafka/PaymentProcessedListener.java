package com.example.orders.notification.kafka;

import com.example.orders.events.PaymentProcessed;
import com.example.orders.notification.api.NotificationEvent;
import com.example.orders.notification.redis.RedisNotificationFanout;

import java.time.Instant;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code payments.processed} — drives Payments list refresh on the UI.
 * Lab 5 — map to NotificationEvent and publish to Redis fan-out.
 */
@Component
public class PaymentProcessedListener {

    private final RedisNotificationFanout fanout;

    public PaymentProcessedListener(RedisNotificationFanout fanout) {
        this.fanout = fanout;
    }

    @KafkaListener(topics = KafkaTopics.PAYMENTS_PROCESSED, groupId = "notification-service")
    public void onPaymentProcessed(PaymentProcessed event) {
        NotificationEvent notificationEvent = new NotificationEvent(
                event.orderId(),
                NotificationEvent.TYPE_PAYMENT_PROCESSED,
                "Payment " + (event.success() ? "OK" : "KO"),
                event.success(),
                event.processedAt() != null ? event.processedAt() : Instant.now());
        fanout.publish(notificationEvent);
    }
}
