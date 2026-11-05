package com.example.orders.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Decides simulated payment success from {@code payment.failure-rate}.
 * Lab 2 — {@link #decideSuccess()}. Rate is mutable at runtime via chaos API.
 */
@Component
public class PaymentDecision {

    private volatile double failureRate;

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

    public double getFailureRate() {
        return failureRate;
    }

    public void setFailureRate(double failureRate) {
        if (failureRate < 0.0 || failureRate > 1.0) {
            throw new IllegalArgumentException("failure rate must be between 0.0 and 1.0");
        }
        this.failureRate = failureRate;
    }
}
