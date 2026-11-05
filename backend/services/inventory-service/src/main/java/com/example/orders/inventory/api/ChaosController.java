package com.example.orders.inventory.api;

import com.example.orders.inventory.InventoryReservation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chaos")
public class ChaosController {

    private final InventoryReservation inventoryReservation;

    public ChaosController(InventoryReservation inventoryReservation) {
        this.inventoryReservation = inventoryReservation;
    }

    @GetMapping("/failure-rate")
    public FailureRateResponse getFailureRate() {
        return new FailureRateResponse(inventoryReservation.getFailureRate());
    }

    @PutMapping("/failure-rate")
    public FailureRateResponse putFailureRate(@Valid @RequestBody FailureRateRequest request) {
        inventoryReservation.setFailureRate(request.rate());
        return new FailureRateResponse(inventoryReservation.getFailureRate());
    }

    public record FailureRateRequest(
            @NotNull
            @DecimalMin("0.0")
            @DecimalMax("1.0")
            Double rate) {
    }

    public record FailureRateResponse(double rate) {
    }
}
