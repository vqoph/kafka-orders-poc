package com.example.orders.payment.kafka;

public final class KafkaTopics {

    /** Consumed (created by order-service). */
    public static final String ORDERS_CREATED = "orders.created";

    /** Produced by this service. */
    public static final String PAYMENTS_PROCESSED = "payments.processed";

    /** Compensation consumed by this service (published by order-service). */
    public static final String PAYMENTS_REFUND_REQUESTED = "payments.refund.requested";

    private KafkaTopics() {
    }
}
