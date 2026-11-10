package com.example.orders.payment;

import com.example.orders.events.OrderCreated;
import com.example.orders.payment.domain.Payment;
import com.example.orders.payment.domain.PaymentRepository;
import com.example.orders.payment.kafka.PaymentEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Decide → persist → publish (dual-write).
 * Idempotent on {@code orderId}: skips when a payment already exists.
 * See doc/fr/appendices/exercises/lab-06-at-least-once.md
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentDecision paymentDecision;
    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher paymentEventPublisher;

    public PaymentService(
            PaymentDecision paymentDecision,
            PaymentRepository paymentRepository,
            PaymentEventPublisher paymentEventPublisher) {
        this.paymentDecision = paymentDecision;
        this.paymentRepository = paymentRepository;
        this.paymentEventPublisher = paymentEventPublisher;
    }

    @Transactional
    public void processOrderCreated(OrderCreated order) {
        if (order.amount() != null && order.amount().signum() < 0) {
            throw new IllegalArgumentException("Payment rejected: negative amount for orderId=" + order.orderId());
        }

        if (paymentRepository.existsByOrderId(order.orderId())) {
            log.info("Skipping already processed payment orderId={}", order.orderId());
            return;
        }

        boolean success = paymentDecision.decideSuccess();

        Payment payment = new Payment(order.orderId(), order.amount(), success);
        paymentRepository.save(payment);

        // Dual-write: DB then Kafka (not atomic — outbox later).
        paymentEventPublisher.publish(payment);
        log.info("Processed payment orderId={} success={}", order.orderId(), success);
    }
}
