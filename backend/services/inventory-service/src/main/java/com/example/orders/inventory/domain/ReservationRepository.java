package com.example.orders.inventory.domain;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    boolean existsByOrderId(UUID orderId);

    Optional<Reservation> findFirstByOrderIdAndSuccessTrueOrderByReservedAtDesc(UUID orderId);
}
