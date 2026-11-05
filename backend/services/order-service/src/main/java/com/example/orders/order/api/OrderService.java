package com.example.orders.order.api;

import com.example.orders.order.domain.Order;
import com.example.orders.order.domain.OrderItem;
import com.example.orders.order.domain.OrderRepository;
import com.example.orders.order.kafka.OrderEventPublisher;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Application service (use-case layer) — like a NestJS {@code @Injectable()}
 * service.
 * Orchestrates persistence (+ Kafka publish). Controllers stay thin.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher orderEventPublisher;

    public OrderService(OrderRepository orderRepository, OrderEventPublisher orderEventPublisher) {
        this.orderRepository = orderRepository;
        this.orderEventPublisher = orderEventPublisher;
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        List<OrderItem> items = request.items().stream()
                .map(item -> new OrderItem(item.sku(), item.quantity()))
                .toList();
        Order order = new Order(request.customerId(), request.amount(), items);
        Order saved = orderRepository.save(order);
        // Dual-write: DB then Kafka (not atomic — outbox comes later).
        orderEventPublisher.publishOrderCreated(saved);
        return OrderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> findAll(Pageable pageable) {
        return orderRepository.findAll(pageable).map(OrderResponse::from);
    }

    @Transactional(readOnly = true)
    public OrderResponse findById(UUID id) {
        Order order = getOrderOrThrow(id);
        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public Order getOrderOrThrow(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"));
    }
}
