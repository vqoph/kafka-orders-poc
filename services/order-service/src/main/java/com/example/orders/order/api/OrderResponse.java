package com.example.orders.order.api;

import com.example.orders.order.domain.Order;
import com.example.orders.order.domain.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String customerId,
        BigDecimal amount,
        OrderStatus status,
        Instant createdAt,
        List<ItemResponse> items
) {
    public record ItemResponse(String sku, int quantity) {
    }

    public static OrderResponse from(Order order) {
        List<ItemResponse> items = order.getItems().stream()
                .map(item -> new ItemResponse(item.getSku(), item.getQuantity()))
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getCustomerId(),
                order.getAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                items
        );
    }
}
