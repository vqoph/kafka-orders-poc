package com.example.orders.notification.kafka;

/** Domain topics this service consumes (same names as producers — no extra “notif bus”). */
public final class KafkaTopics {

    public static final String ORDERS_STATUS = "orders.status";
    public static final String PAYMENTS_PROCESSED = "payments.processed";
    public static final String INVENTORY_RESERVED = "inventory.reserved";

    private KafkaTopics() {
    }
}
