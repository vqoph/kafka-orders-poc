package com.example.orders.order.saga;

import com.example.orders.events.InventoryReleaseRequested;
import com.example.orders.events.OrderStatusChanged;
import com.example.orders.events.PaymentRefundRequested;
import com.example.orders.order.domain.Order;
import com.example.orders.order.kafka.KafkaTopics;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class SagaEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(SagaEventPublisher.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public SagaEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishStatusChanged(Order order) {
        OrderStatusChanged event = new OrderStatusChanged(
                order.getId(),
                order.getStatus().name(),
                Instant.now()
        );
        String key = order.getId().toString();
        kafkaTemplate.send(KafkaTopics.ORDERS_STATUS, key, event);
        log.info("Published {} key={} status={}", KafkaTopics.ORDERS_STATUS, key, order.getStatus());
    }

    public void publishRefundRequested(Order order) {
        PaymentRefundRequested event = new PaymentRefundRequested(
                order.getId(),
                order.getAmount(),
                Instant.now()
        );
        String key = order.getId().toString();
        kafkaTemplate.send(KafkaTopics.PAYMENTS_REFUND_REQUESTED, key, event);
        log.info("Published {} key={}", KafkaTopics.PAYMENTS_REFUND_REQUESTED, key);
    }

    public void publishReleaseRequested(Order order) {
        InventoryReleaseRequested event = new InventoryReleaseRequested(
                order.getId(),
                Instant.now()
        );
        String key = order.getId().toString();
        kafkaTemplate.send(KafkaTopics.INVENTORY_RELEASE_REQUESTED, key, event);
        log.info("Published {} key={}", KafkaTopics.INVENTORY_RELEASE_REQUESTED, key);
    }
}
