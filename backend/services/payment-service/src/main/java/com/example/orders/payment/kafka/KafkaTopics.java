package com.example.orders.payment.kafka;

public final class KafkaTopics {

    /** Consumed (created by order-service). */
    public static final String ORDERS_CREATED = "orders.created";

    /** Dead letter for failed {@link #ORDERS_CREATED} processing. */
    public static final String ORDERS_CREATED_DLT = "orders.created.DLT";

    /** Produced by this service. */
    public static final String PAYMENTS_PROCESSED = "payments.processed";

    /** Compensation consumed by this service (published by order-service). */
    public static final String PAYMENTS_REFUND_REQUESTED = "payments.refund.requested";

    private KafkaTopics() {
    }
}
