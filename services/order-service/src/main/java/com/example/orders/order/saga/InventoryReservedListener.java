package com.example.orders.order.saga;

import com.example.orders.events.InventoryReserved;
import com.example.orders.order.kafka.KafkaTopics;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class InventoryReservedListener {

    private final SagaService sagaService;

    public InventoryReservedListener(SagaService sagaService) {
        this.sagaService = sagaService;
    }

    @KafkaListener(topics = KafkaTopics.INVENTORY_RESERVED, groupId = "order-service")
    public void onInventoryReserved(InventoryReserved event) {
        sagaService.onInventoryReserved(event);
    }
}
