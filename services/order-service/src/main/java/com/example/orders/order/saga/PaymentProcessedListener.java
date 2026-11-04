package com.example.orders.order.saga;

import com.example.orders.events.PaymentProcessed;
import com.example.orders.order.kafka.KafkaTopics;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentProcessedListener {

    private final SagaService sagaService;

    public PaymentProcessedListener(SagaService sagaService) {
        this.sagaService = sagaService;
    }

    @KafkaListener(topics = KafkaTopics.PAYMENTS_PROCESSED, groupId = "order-service")
    public void onPaymentProcessed(PaymentProcessed event) {
        sagaService.onPaymentProcessed(event);
    }
}
