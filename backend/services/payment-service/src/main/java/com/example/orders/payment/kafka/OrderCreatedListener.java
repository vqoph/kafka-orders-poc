package com.example.orders.payment.kafka;

import com.example.orders.events.OrderCreated;
import com.example.orders.payment.PaymentService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes {@code orders.created} in group {@code payment-service}.
 * Thin adapter: delegates to {@link PaymentService}.
 */
@Component
public class OrderCreatedListener {

    private final PaymentService paymentService;

    public OrderCreatedListener(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @KafkaListener(topics = KafkaTopics.ORDERS_CREATED, groupId = "payment-service")
    public void onOrderCreated(OrderCreated event) {
        paymentService.processOrderCreated(event);
    }
}
