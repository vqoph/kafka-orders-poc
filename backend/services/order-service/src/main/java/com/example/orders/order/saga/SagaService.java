package com.example.orders.order.saga;

import com.example.orders.events.InventoryReserved;
import com.example.orders.events.PaymentProcessed;
import com.example.orders.order.domain.Order;
import com.example.orders.order.domain.OrderRepository;
import com.example.orders.order.domain.OrderStatus;

import java.util.UUID;

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
        Order order = getOrderAndValidate(event.orderId());
        if (order == null) {
            return;
        }
        order.recordPaymentResult(event.success(), event.failureReason());
        tryComplete(order);
    }

    @Transactional
    public void onInventoryReserved(InventoryReserved event) {
        Order order = getOrderAndValidate(event.orderId());
        if (order == null) {
            return;
        }
        order.recordInventoryResult(event.success(), event.failureReason());
        tryComplete(order);
    }

    /*
     * ## Lab 3 — tryComplete (à coder)
     */
    private void tryComplete(Order order) {
        if (order.getStatus() != OrderStatus.PENDING || !order.hasBothSagaResults()) {
            return;
        }

        if (order.hasBothSagaSuccess()) {
            order.confirm();
            orderRepository.save(order);
            sagaEventPublisher.publishStatusChanged(order);
            return;
        }

        order.cancel();
        orderRepository.save(order);
        sagaEventPublisher.publishStatusChanged(order);
        if (order.getPaymentSuccess()) {
            sagaEventPublisher.publishRefundRequested(order);
        }
        if (order.getInventorySuccess()) {
            sagaEventPublisher.publishReleaseRequested(order);
        }

    }

    private Order getOrderAndValidate(UUID orderId) {
        Order order = orderRepository.findByIdForUpdate(orderId).orElse(null);
        if (order == null) {
            log.warn("Unknown orderId={}", orderId);
            return null;
        }
        if (order.isTerminal()) {
            return null;
        }
        return order;
    }
}
