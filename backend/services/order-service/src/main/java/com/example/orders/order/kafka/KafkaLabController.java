package com.example.orders.order.kafka;

import com.example.orders.order.api.OrderResponse;
import com.example.orders.order.api.OrderService;
import com.example.orders.order.domain.Order;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Non-business endpoints to re-publish an order with a chosen Kafka key
 * (partition / key experiments).
 * See doc/fr/appendices/exercises/lab-01-keys-partitions.md
 */
@RestController
@RequestMapping("/labs/kafka")
public class KafkaLabController {

    /**
     * Kafka key strategy for republish. Spring binds {@code ?keyMode=} to the
     * enum constant name ({@code ORDER_ID}, {@code NONE}).
     */
    public enum KeyMode {
        ORDER_ID,
        NONE
    }

    private final OrderService orderService;
    private final OrderEventPublisher orderEventPublisher;

    public KafkaLabController(OrderService orderService, OrderEventPublisher orderEventPublisher) {
        this.orderService = orderService;
        this.orderEventPublisher = orderEventPublisher;
    }

    /**
     * Re-publishes an existing order to {@code orders.created}.
     *
     * @param keyMode {@code ORDER_ID} or {@code NONE} (enum name in the query
     *                string)
     */
    @PostMapping("/orders/{id}/republish")
    @Operation(operationId = "republish")
    public RepublishResponse republish(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "ORDER_ID") KeyMode keyMode) {
        Order order = orderService.getOrderOrThrow(id);
        String key = resolveKey(order, keyMode);
        orderEventPublisher.publishOrderCreatedWithKey(order, key);
        return new RepublishResponse(
                KafkaTopics.ORDERS_CREATED,
                keyMode.name(),
                key == null ? "" : key,
                OrderResponse.from(order));
    }

    @Schema(requiredProperties = {"topic", "keyMode", "key", "order"})
    public record RepublishResponse(
            String topic,
            String keyMode,
            String key,
            OrderResponse order) {
    }

    /** Maps {@link KeyMode} to the Kafka message key ({@code null} = no key). */
    String resolveKey(Order order, KeyMode keyMode) {
        return switch (keyMode) {
            case ORDER_ID -> order.getId().toString();
            case NONE -> null;
        };
    }
}
