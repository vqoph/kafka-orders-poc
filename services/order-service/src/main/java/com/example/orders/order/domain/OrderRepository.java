package com.example.orders.order.domain;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data repository — interface only; Spring generates the implementation
 * ({@code save}, {@code findAll}, {@code findById}, …). Like a Nest/MikroORM repository.
 */
public interface OrderRepository extends JpaRepository<Order, UUID> {
}
