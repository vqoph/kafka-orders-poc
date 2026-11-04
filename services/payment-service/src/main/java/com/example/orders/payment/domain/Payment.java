package com.example.orders.payment.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for a payment decision row in {@code payments}.
 * {@code processedAt} is stored here, then copied into {@code PaymentProcessed}.
 */
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private boolean success;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    protected Payment() {
        // JPA
    }

    public Payment(UUID orderId, BigDecimal amount, boolean success) {
        this.id = UUID.randomUUID();
        this.orderId = orderId;
        this.amount = amount;
        this.success = success;
        this.processedAt = Instant.now();
    }

    public void markRefunded() {
        this.refundedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public boolean isSuccess() {
        return success;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }

    public Instant getRefundedAt() {
        return refundedAt;
    }
}
