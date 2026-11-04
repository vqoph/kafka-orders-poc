package com.example.orders.order.kafka;

import com.example.orders.events.OrderCreated;
import com.example.orders.events.OrderItemData;
import com.example.orders.order.domain.Order;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);

    private final KafkaTemplate<String, OrderCreated> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, OrderCreated> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /** Production path: key = orderId (same key => same partition => ordered). */
    public void publishOrderCreated(Order order) {
        OrderCreated event = toEvent(order);
        String key = order.getId().toString();
        kafkaTemplate.send(KafkaTopics.ORDERS_CREATED, key, event);
        log.info("Published {} key={} orderId={}", KafkaTopics.ORDERS_CREATED, key, order.getId());
    }

    /**
     * Lab 1 helper: same payload as {@link #publishOrderCreated(Order)}, but key is chosen
     * by the caller ({@code null} = no key). Always publish {@link OrderCreated}, never {@link Order}.
     */
    public void publishOrderCreatedWithKey(Order order, String key) {
        OrderCreated event = toEvent(order);
        kafkaTemplate.send(KafkaTopics.ORDERS_CREATED, key, event);
        log.info("Published {} key={} orderId={}", KafkaTopics.ORDERS_CREATED, key, order.getId());
    }

    private static OrderCreated toEvent(Order order) {
        List<OrderItemData> items = order.getItems().stream()
                .map(item -> new OrderItemData(item.getSku(), item.getQuantity()))
                .toList();
        return new OrderCreated(
                order.getId(),
                order.getCustomerId(),
                order.getAmount(),
                items,
                order.getCreatedAt());
    }
}
