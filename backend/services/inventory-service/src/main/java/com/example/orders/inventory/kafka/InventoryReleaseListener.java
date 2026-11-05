package com.example.orders.inventory.kafka;

import com.example.orders.events.InventoryReleaseRequested;
import com.example.orders.inventory.InventoryService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class InventoryReleaseListener {

    private final InventoryService inventoryService;

    public InventoryReleaseListener(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @KafkaListener(topics = KafkaTopics.INVENTORY_RELEASE_REQUESTED, groupId = "inventory-service")
    public void onReleaseRequested(InventoryReleaseRequested event) {
        inventoryService.processReleaseRequested(event);
    }
}
