package com.example.orders.payment.api;

import com.example.orders.payment.PaymentDecision;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
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

    private final PaymentDecision paymentDecision;

    public ChaosController(PaymentDecision paymentDecision) {
        this.paymentDecision = paymentDecision;
    }

    @GetMapping("/failure-rate")
    @Operation(operationId = "getPaymentFailureRate")
    public FailureRateResponse getFailureRate() {
        return new FailureRateResponse(paymentDecision.getFailureRate());
    }

    @PutMapping("/failure-rate")
    @Operation(operationId = "setPaymentFailureRate")
    public FailureRateResponse putFailureRate(@Valid @RequestBody FailureRateRequest request) {
        paymentDecision.setFailureRate(request.rate());
        return new FailureRateResponse(paymentDecision.getFailureRate());
    }

    public record FailureRateRequest(
            @NotNull
            @DecimalMin("0.0")
            @DecimalMax("1.0")
            Double rate) {
    }

    @Schema(requiredProperties = {"rate"})
    public record FailureRateResponse(double rate) {
    }
}
