package com.example.orders.order.kafka;

public final class KafkaTopics {

    public static final String ORDERS_CREATED = "orders.created";
    public static final String ORDERS_STATUS = "orders.status";

    public static final String PAYMENTS_PROCESSED = "payments.processed";
    public static final String PAYMENTS_REFUND_REQUESTED = "payments.refund.requested";

    public static final String INVENTORY_RESERVED = "inventory.reserved";
    public static final String INVENTORY_RELEASE_REQUESTED = "inventory.release.requested";

    private KafkaTopics() {
    }
}
