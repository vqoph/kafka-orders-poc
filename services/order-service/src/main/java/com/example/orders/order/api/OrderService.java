package com.example.orders.order.api;

import com.example.orders.order.domain.Order;
import com.example.orders.order.domain.OrderItem;
import com.example.orders.order.domain.OrderRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        List<OrderItem> items = request.items().stream()
                .map(item -> new OrderItem(item.sku(), item.quantity()))
                .toList();
        Order order = new Order(request.customerId(), request.amount(), items);
        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> findAll() {
        return orderRepository.findAll().stream()
                .map(OrderResponse::from)
                .toList();
    }
}
