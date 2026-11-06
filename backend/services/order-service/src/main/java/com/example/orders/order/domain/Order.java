package com.example.orders.order.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JPA entity — the database model for a row in {@code orders} (plus embedded
 * items).
 * Not the same as the HTTP DTO ({@code OrderResponse}): entities stay close to
 * the schema.
 */
@Entity
@Table(name = "orders")
public class Order {

    @Id
    private UUID id;

    @Column(name = "customer_id", nullable = false, length = 64)
    private String customerId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OrderStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    /** {@code null} until {@code payments.processed} is applied. */
    @Column(name = "payment_success")
    private Boolean paymentSuccess;

    /** {@code null} until {@code inventory.reserved} is applied. */
    @Column(name = "inventory_success")
    private Boolean inventorySuccess;

    /** Set when a saga step fails; populated on CANCELLED orders. */
    @Column(name = "error_message", length = 512)
    private String errorMessage;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    private List<OrderItem> items = new ArrayList<>();

    protected Order() {
        // JPA
    }

    public Order(String customerId, BigDecimal amount, List<OrderItem> items) {
        this.id = UUID.randomUUID();
        this.customerId = customerId;
        this.amount = amount;
        this.status = OrderStatus.PENDING;
        this.createdAt = Instant.now();
        this.items = new ArrayList<>(items);
    }

    public void recordPaymentResult(boolean success, String failureReason) {
        this.paymentSuccess = success;
        if (!success) {
            appendErrorMessage(failureReason);
        }
    }

    public void recordInventoryResult(boolean success, String failureReason) {
        this.inventorySuccess = success;
        if (!success) {
            appendErrorMessage(failureReason);
        }
    }

    private void appendErrorMessage(String failureReason) {
        if (failureReason == null || failureReason.isBlank()) {
            return;
        }
        if (this.errorMessage == null || this.errorMessage.isBlank()) {
            this.errorMessage = failureReason;
        } else {
            this.errorMessage = this.errorMessage + "; " + failureReason;
        }
    }

    public void confirm() {
        this.status = OrderStatus.CONFIRMED;
    }

    public void cancel() {
        this.status = OrderStatus.CANCELLED;
    }

    public boolean isTerminal() {
        return status == OrderStatus.CONFIRMED || status == OrderStatus.CANCELLED;
    }

    public boolean hasBothSagaResults() {
        return paymentSuccess != null && inventorySuccess != null;
    }

    public boolean hasBothSagaSuccess() {
        return hasBothSagaResults() && paymentSuccess && inventorySuccess;
    }

    public UUID getId() {
        return id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Boolean getPaymentSuccess() {
        return paymentSuccess;
    }

    public Boolean getInventorySuccess() {
        return inventorySuccess;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public List<OrderItem> getItems() {
        return List.copyOf(items);
    }
}
