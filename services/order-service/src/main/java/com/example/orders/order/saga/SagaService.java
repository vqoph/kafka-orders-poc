package com.example.orders.order.saga;

import com.example.orders.events.InventoryReserved;
import com.example.orders.events.PaymentProcessed;
import com.example.orders.order.domain.Order;
import com.example.orders.order.domain.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lab 3 — saga aggregation ({@link #tryComplete(Order)}).
 */
@Service
public class SagaService {

    private static final Logger log = LoggerFactory.getLogger(SagaService.class);

    private final OrderRepository orderRepository;
    private final SagaEventPublisher sagaEventPublisher;

    public SagaService(OrderRepository orderRepository, SagaEventPublisher sagaEventPublisher) {
        this.orderRepository = orderRepository;
        this.sagaEventPublisher = sagaEventPublisher;
    }

    @Transactional
    public void onPaymentProcessed(PaymentProcessed event) {
        Order order = orderRepository.findById(event.orderId()).orElse(null);
        if (order == null) {
            log.warn("Payment for unknown orderId={}", event.orderId());
            return;
        }
        if (order.isTerminal()) {
            return;
        }
        order.recordPaymentResult(event.success());
        tryComplete(order);
    }

    @Transactional
    public void onInventoryReserved(InventoryReserved event) {
        Order order = orderRepository.findById(event.orderId()).orElse(null);
        if (order == null) {
            log.warn("Inventory for unknown orderId={}", event.orderId());
            return;
        }
        if (order.isTerminal()) {
            return;
        }
        order.recordInventoryResult(event.success());
        tryComplete(order);
    }

    /*
     * ## Lab 3 — tryComplete (à coder)
     *
     * If either paymentSuccess or inventorySuccess is still null → return (wait).
     * If status is not PENDING → return.
     * Both true → order.confirm(), save, publishStatusChanged.
     * Else → order.cancel(), save, publishStatusChanged;
     *   if payment was true → publishRefundRequested;
     *   if inventory was true → publishReleaseRequested.
     *
     * Helpers on Order: hasBothSagaResults(), getPaymentSuccess(), getInventorySuccess(),
     * confirm(), cancel(). Publisher: sagaEventPublisher.
     *
     * See doc/fr/appendices/exercises/lab-03-saga-choreography.md (A.2).
     */
    void tryComplete(Order order) {
        throw new UnsupportedOperationException("TODO Lab 3: implement saga aggregation");
    }
}
