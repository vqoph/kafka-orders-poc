package com.example.orders.inventory.kafka;

public final class KafkaTopics {

    public static final String ORDERS_CREATED = "orders.created";
    public static final String INVENTORY_RESERVED = "inventory.reserved";
    public static final String INVENTORY_RELEASE_REQUESTED = "inventory.release.requested";

    private KafkaTopics() {
    }
}
