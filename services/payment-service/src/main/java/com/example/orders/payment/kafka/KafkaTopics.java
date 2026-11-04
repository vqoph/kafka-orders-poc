package com.example.orders.payment.kafka;

public final class KafkaTopics {

    /** Consumed (created by order-service). */
    public static final String ORDERS_CREATED = "orders.created";

    /** Produced by this service. */
    public static final String PAYMENTS_PROCESSED = "payments.processed";

    private KafkaTopics() {
    }
}
