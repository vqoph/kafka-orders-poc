package com.example.orders.payment.domain;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    boolean existsByOrderId(UUID orderId);

    Optional<Payment> findFirstByOrderIdAndSuccessTrueOrderByProcessedAtDesc(UUID orderId);
}
