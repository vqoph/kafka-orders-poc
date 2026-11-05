package com.example.orders.order.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

/** Incoming JSON body — Java record ≈ readonly DTO in TypeScript. */
@Schema(requiredProperties = {"customerId", "items", "amount"})
public record CreateOrderRequest(
        @NotBlank String customerId,
        @NotEmpty List<@Valid OrderItemRequest> items,
        @NotNull @DecimalMin("0.01") BigDecimal amount
) {
    @Schema(requiredProperties = {"sku", "quantity"})
    public record OrderItemRequest(
            @NotBlank String sku,
            @NotNull @Positive Integer quantity
    ) {
    }
}
