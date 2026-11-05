package com.example.orders.payment.kafka;

import com.example.orders.events.PaymentProcessed;
import com.example.orders.payment.domain.Payment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes {@link PaymentProcessed} to {@code payments.processed}.
 * {@code processedAt} comes from the persisted {@link Payment} (same as order-service).
 */
@Component
public class PaymentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventPublisher.class);

    private final KafkaTemplate<String, PaymentProcessed> kafkaTemplate;

    public PaymentEventPublisher(KafkaTemplate<String, PaymentProcessed> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(Payment payment) {
        PaymentProcessed event = new PaymentProcessed(
                payment.getOrderId(),
                payment.getAmount(),
                payment.isSuccess(),
                payment.getProcessedAt()
        );
        String key = payment.getOrderId().toString();
        kafkaTemplate.send(KafkaTopics.PAYMENTS_PROCESSED, key, event);
        log.info(
                "Published {} key={} success={}",
                KafkaTopics.PAYMENTS_PROCESSED,
                key,
                payment.isSuccess()
        );
    }
}
