package com.example.orders.inventory.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Incoming JSON for {@code POST /stock}.
 * See doc/fr/appendices/exercises/lab-04-stock-payment-rest.md
 */
@Schema(requiredProperties = {"sku", "quantity"})
public record CreateStockRequest(
        @NotBlank String sku,
        @NotNull @Min(0) Integer quantity) {
}
