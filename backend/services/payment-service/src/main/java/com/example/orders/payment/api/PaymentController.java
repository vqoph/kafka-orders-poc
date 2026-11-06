package com.example.orders.payment.api;

import io.swagger.v3.oas.annotations.Operation;
import java.util.UUID;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST adapter for payment reads (Lab 4). Chaos stays on {@link ChaosController}.
 * Controllers stay thin — logic lives in {@link PaymentService}.
 */
@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    @Operation(operationId = "listPayments")
    public Page<PaymentResponse> list(
            @ParameterObject
            @PageableDefault(sort = "processedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return paymentService.findAll(pageable);
    }

    @GetMapping("/{id}")
    @Operation(operationId = "getPayment")
    public PaymentResponse getById(@PathVariable UUID id) {
        return paymentService.findById(id);
    }
}
