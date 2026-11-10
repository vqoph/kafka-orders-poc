package com.example.orders.inventory.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Incoming JSON for {@code PUT /stock/{sku}}.
 * See doc/fr/appendices/exercises/lab-04-stock-payment-rest.md
 */
@Schema(requiredProperties = {"quantity"})
public record UpdateStockRequest(@NotNull @Min(0) Integer quantity) {
}
