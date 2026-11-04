package com.example.orders.inventory.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stock")
public class Stock {

    @Id
    @Column(length = 64)
    private String sku;

    @Column(nullable = false)
    private int quantity;

    protected Stock() {
        // JPA
    }

    public String getSku() {
        return sku;
    }

    public int getQuantity() {
        return quantity;
    }

    public void decrement(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("amount must be positive");
        }
        if (quantity < amount) {
            throw new IllegalStateException("insufficient stock for " + sku);
        }
        this.quantity -= amount;
    }

    public void increment(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("amount must be positive");
        }
        this.quantity += amount;
    }
}
