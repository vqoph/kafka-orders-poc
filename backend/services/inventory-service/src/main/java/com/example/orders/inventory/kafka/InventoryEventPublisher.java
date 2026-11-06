package com.example.orders.inventory.kafka;

import com.example.orders.events.InventoryReserved;
import com.example.orders.inventory.domain.Reservation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class InventoryEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(InventoryEventPublisher.class);

    private final KafkaTemplate<String, InventoryReserved> kafkaTemplate;

    public InventoryEventPublisher(KafkaTemplate<String, InventoryReserved> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishReserved(Reservation reservation) {
        InventoryReserved event = new InventoryReserved(
                reservation.getOrderId(),
                reservation.isSuccess(),
                reservation.getReservedAt(),
                reservation.getFailureReason()
        );
        String key = reservation.getOrderId().toString();
        kafkaTemplate.send(KafkaTopics.INVENTORY_RESERVED, key, event);
        log.info(
                "Published {} key={} success={}",
                KafkaTopics.INVENTORY_RESERVED,
                key,
                reservation.isSuccess()
        );
    }
}
