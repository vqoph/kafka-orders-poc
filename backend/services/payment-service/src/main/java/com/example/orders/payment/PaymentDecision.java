package com.example.orders.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Decides simulated payment success from {@code payment.failure-rate}.
 * Lab 2 — {@link #decideSuccess()}.
 */
@Component
public class PaymentDecision {

    private final double failureRate;

    public PaymentDecision(@Value("${payment.failure-rate}") double failureRate) {
        this.failureRate = failureRate;
    }

    /**
     * Lab 2 — mock success: {@code Math.random() >= failureRate}
     * ({@code 0.0} = always OK, {@code 1.0} = always KO).
     */
    public boolean decideSuccess() {
        return Math.random() >= failureRate;
    }
}
