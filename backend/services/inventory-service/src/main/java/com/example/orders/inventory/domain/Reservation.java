package com.example.orders.inventory.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reservations", uniqueConstraints = @UniqueConstraint(
        name = "uk_reservations_order_id", columnNames = "order_id"))
public class Reservation {

    @Id
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(nullable = false)
    private boolean success;

    @Column(name = "reserved_at", nullable = false)
    private Instant reservedAt;

    @Column(name = "failure_reason", length = 512)
    private String failureReason;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "reservation_items", joinColumns = @JoinColumn(name = "reservation_id"))
    private List<ReservationItem> items = new ArrayList<>();

    protected Reservation() {
        // JPA
    }

    public Reservation(UUID orderId, boolean success, List<ReservationItem> items) {
        this(orderId, success, items, null);
    }

    public Reservation(UUID orderId, boolean success, List<ReservationItem> items, String failureReason) {
        this.id = UUID.randomUUID();
        this.orderId = orderId;
        this.success = success;
        this.reservedAt = Instant.now();
        this.items = new ArrayList<>(items);
        this.failureReason = failureReason;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public boolean isSuccess() {
        return success;
    }

    public Instant getReservedAt() {
        return reservedAt;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public List<ReservationItem> getItems() {
        return List.copyOf(items);
    }
}
