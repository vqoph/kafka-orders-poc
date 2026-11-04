package com.example.orders.order.domain;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data generates the implementation at runtime (like a Nest repository). */
public interface OrderRepository extends JpaRepository<Order, UUID> {
}
