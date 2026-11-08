package com.example.orders.inventory.kafka;

public final class KafkaTopics {

    public static final String ORDERS_CREATED = "orders.created";

    /** Dead letter for failed {@link #ORDERS_CREATED} processing. */
    public static final String ORDERS_CREATED_DLT = "orders.created.DLT";

    public static final String INVENTORY_RESERVED = "inventory.reserved";
    public static final String INVENTORY_RELEASE_REQUESTED = "inventory.release.requested";

    private KafkaTopics() {
    }
}
