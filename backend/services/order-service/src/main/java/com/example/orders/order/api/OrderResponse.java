package com.example.orders.order.api;

import com.example.orders.order.domain.Order;
import com.example.orders.order.domain.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO (Data Transfer Object) — what we send as JSON to the client.
 * Kept separate from the JPA {@link Order} entity so the HTTP API can evolve
 * without coupling clients to the database model.
 */
@Schema(requiredProperties = {"id", "customerId", "amount", "status", "createdAt", "items"})
public record OrderResponse(
        UUID id,
        String customerId,
        BigDecimal amount,
        OrderStatus status,
        Instant createdAt,
        List<ItemResponse> items,
        @Schema(nullable = true) Boolean paymentSuccess,
        @Schema(nullable = true) Boolean inventorySuccess,
        @Schema(nullable = true) String errorMessage) {
    @Schema(requiredProperties = {"sku", "quantity"})
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
                items,
                order.getPaymentSuccess(),
                order.getInventorySuccess(),
                order.getErrorMessage());
    }
}
