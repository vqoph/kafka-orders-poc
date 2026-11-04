package com.example.orders.inventory.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(nullable = false)
    private boolean success;

    @Column(name = "reserved_at", nullable = false)
    private Instant reservedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "reservation_items", joinColumns = @JoinColumn(name = "reservation_id"))
    private List<ReservationItem> items = new ArrayList<>();

    protected Reservation() {
        // JPA
    }

    public Reservation(UUID orderId, boolean success, List<ReservationItem> items) {
        this.id = UUID.randomUUID();
        this.orderId = orderId;
        this.success = success;
        this.reservedAt = Instant.now();
        this.items = new ArrayList<>(items);
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

    public List<ReservationItem> getItems() {
        return List.copyOf(items);
    }
}
