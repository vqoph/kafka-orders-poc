package com.example.orders.order.domain;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data repository — interface only; Spring generates the implementation
 * ({@code save}, {@code findAll}, {@code findById}, …). Like a Nest/MikroORM repository.
 */
public interface OrderRepository extends JpaRepository<Order, UUID> {

    /**
     * Load order with {@code SELECT … FOR UPDATE} so payment + inventory saga
     * listeners cannot race on the same row.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") UUID id);
}
