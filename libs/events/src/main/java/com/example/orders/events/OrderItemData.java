package com.example.orders.events;

/** Line item carried inside order-related Kafka events. */
public record OrderItemData(String sku, int quantity) {
}
