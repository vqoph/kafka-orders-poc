package com.example.orders.inventory.kafka;

import com.example.orders.events.OrderCreated;
import com.example.orders.inventory.InventoryService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedListener {

    private final InventoryService inventoryService;

    public OrderCreatedListener(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @KafkaListener(topics = KafkaTopics.ORDERS_CREATED, groupId = "inventory-service")
    public void onOrderCreated(OrderCreated event) {
        inventoryService.processOrderCreated(event);
    }
}
