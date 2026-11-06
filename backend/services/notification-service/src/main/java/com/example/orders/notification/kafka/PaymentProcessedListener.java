package com.example.orders.notification.kafka;

import com.example.orders.events.PaymentProcessed;
import com.example.orders.notification.sse.SseHub;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code payments.processed} — drives Payments list refresh on the UI.
 * Lab 5 — map to NotificationEvent and broadcast.
 */
@Component
public class PaymentProcessedListener {

    private final SseHub sseHub;

    public PaymentProcessedListener(SseHub sseHub) {
        this.sseHub = sseHub;
    }

    @KafkaListener(topics = KafkaTopics.PAYMENTS_PROCESSED, groupId = "notification-service")
    public void onPaymentProcessed(PaymentProcessed event) {
        /*
         * ## Lab 5 — map + broadcast (à coder)
         *
         * type = NotificationEvent.TYPE_PAYMENT_PROCESSED
         * message e.g. "Payment " + (event.success() ? "OK" : "KO")
         * then sseHub.broadcast(...).
         */
        if (sseHub == null || event == null) {
            return;
        }
        // TODO Lab 5
    }
}
